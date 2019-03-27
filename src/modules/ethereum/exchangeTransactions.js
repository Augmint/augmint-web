import store from "modules/store";
import BigNumber from "bignumber.js";
import { cost } from "./gas";
import { EthereumTransactionError, processTx } from "modules/ethereum/ethHelper";

import { ONE_ETH_IN_WEI, DECIMALS_DIV, PPM_DIV, LEGACY_CONTRACTS_CHUNK_SIZE, CHUNK_SIZE } from "utils/constants";

export const TOKEN_BUY = 0;
export const TOKEN_SELL = 1;

export async function fetchOrders(_exchangeInstance) {
    // TODO: handle when order changes while iterating
    const exchangeInstance = _exchangeInstance
        ? _exchangeInstance
        : store.getState().contracts.latest.exchange.web3ContractInstance;
    const isLegacyExchangeContract = typeof exchangeInstance.methods.CHUNK_SIZE === "function";
    const chunkSize = isLegacyExchangeContract ? LEGACY_CONTRACTS_CHUNK_SIZE : CHUNK_SIZE;

    const orderCounts = await exchangeInstance.methods.getActiveOrderCounts().call();
    const buyCount = parseInt(orderCounts.buyTokenOrderCount, 10);
    const sellCount = parseInt(orderCounts.sellTokenOrderCount, 10);

    // retreive all orders
    let buyOrders = [];
    let queryCount = Math.ceil(buyCount / LEGACY_CONTRACTS_CHUNK_SIZE);

    for (let i = 0; i < queryCount; i++) {
        const fetchedOrders = isLegacyExchangeContract
            ? await getOrders(exchangeInstance, TOKEN_BUY, i * chunkSize)
            : await getOrders(exchangeInstance, TOKEN_BUY, i * chunkSize, chunkSize);
        buyOrders = buyOrders.concat(fetchedOrders.buyOrders);
    }

    let sellOrders = [];
    queryCount = Math.ceil(sellCount / chunkSize);
    for (let i = 0; i < queryCount; i++) {
        const fetchedOrders = isLegacyExchangeContract
            ? await getOrders(exchangeInstance, TOKEN_SELL, i * chunkSize)
            : await getOrders(exchangeInstance, TOKEN_SELL, i * chunkSize, chunkSize);
        sellOrders = sellOrders.concat(fetchedOrders.sellOrders);
    }

    buyOrders.sort((o1, o2) => isOrderBetter(o1, o2));
    sellOrders.sort((o1, o2) => isOrderBetter(o1, o2));

    return { buyOrders, sellOrders };
}

async function getOrders(exchangeInstance, orderDirection, offset) {
    const blockGasLimit = Math.floor(store.getState().web3Connect.info.gasLimit * 0.9); // gasLimit was read at connection time, prepare for some variance

    const isLegacyExchangeContract = typeof exchangeInstance.methods.CHUNK_SIZE === "function";
    const chunkSize = isLegacyExchangeContract ? LEGACY_CONTRACTS_CHUNK_SIZE : CHUNK_SIZE;

    let result;
    if (orderDirection === TOKEN_BUY) {
        result = isLegacyExchangeContract
            ? await exchangeInstance.methods.getActiveBuyOrders(offset).call({ gas: blockGasLimit })
            : await exchangeInstance.methods.getActiveBuyOrders(offset, chunkSize).call({ gas: blockGasLimit });
    } else {
        result = isLegacyExchangeContract
            ? await exchangeInstance.methods.getActiveSellOrders(offset).call({ gas: blockGasLimit })
            : await exchangeInstance.methods.getActiveSellOrders(offset, chunkSize).call({ gas: blockGasLimit });
    }

    // result format: [id, maker, price, amount]
    const orders = result.reduce(
        (res, order, idx) => {
            const bn_amount = new BigNumber(order[3]);
            if (!bn_amount.eq(0)) {
                const parsed = {
                    id: parseInt(order[0], 10),
                    maker: "0x" + new BigNumber(order[1]).toString(16).padStart(40, "0"), // leading 0s if address starts with 0
                    bn_price: new BigNumber(order[2]),
                    bn_amount
                };

                parsed.price = parsed.bn_price / PPM_DIV;

                if (orderDirection === TOKEN_BUY) {
                    parsed.direction = TOKEN_BUY;
                    parsed.bn_ethAmount = parsed.bn_amount.div(ONE_ETH_IN_WEI);
                    parsed.amount = parseFloat(parsed.bn_ethAmount);

                    res.buyOrders.push(parsed);
                } else {
                    parsed.direction = TOKEN_SELL;
                    parsed.amount = parseFloat((parsed.bn_amount / DECIMALS_DIV).toFixed(2));

                    res.sellOrders.push(parsed);
                }
            }
            return res;
        },
        { buyOrders: [], sellOrders: [] }
    );

    return orders;
}

export function isOrderBetter(o1, o2) {
    if (o1.direction !== o2.direction) {
        throw new Error("isOrderBetter(): order directions must be the same" + o1 + o2);
    }

    const dir = o1.direction === TOKEN_SELL ? 1 : -1;
    return o1.price * dir > o2.price * dir || (o1.price === o2.price && o1.id > o2.id) || -1;
}

export async function placeOrderTx(orderDirection, amount, price) {
    const gasEstimate = cost.PLACE_ORDER_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const exchangeInstance = store.getState().contracts.latest.exchange.web3ContractInstance;

    const submitPrice = new BigNumber(price).mul(PPM_DIV);
    let submitAmount;
    let tx;
    let txName;

    switch (orderDirection) {
        case TOKEN_BUY:
            submitAmount = new BigNumber(amount).mul(ONE_ETH_IN_WEI);
            txName = "Buy token order";
            tx = exchangeInstance.methods.placeBuyTokenOrder(submitPrice.toString()).send({
                value: submitAmount,
                from: userAccount,
                gas: gasEstimate
            });
            break;

        case TOKEN_SELL:
            const augmintTokenInstance = store.getState().contracts.latest.augmintToken.web3ContractInstance;
            submitAmount = new BigNumber(amount).mul(DECIMALS_DIV);
            txName = "Sell token order";
            tx = augmintTokenInstance.methods
                .transferAndNotify(exchangeInstance._address, submitAmount.toString(), submitPrice.toString())
                .send({ from: userAccount, gas: gasEstimate });
            break;

        default:
            throw new EthereumTransactionError(
                "Place order failed.",
                "Unknown orderDirection: " + orderDirection,
                null,
                gasEstimate
            );
    }

    let onReceipt;
    if (orderDirection === TOKEN_SELL) {
        // tokenSell is called on AugmintToken and event emmitted from Exchange is not parsed by web3
        onReceipt = receipt => {
            const web3 = store.getState().web3Connect.web3Instance;
            const newOrderEventInputs = exchangeInstance.options.jsonInterface.find(val => val.name === "NewOrder")
                .inputs;

            const decodedArgs = web3.eth.abi.decodeLog(
                newOrderEventInputs,
                receipt.events[0].raw.data,
                receipt.events[0].raw.topics.slice(1) // topics[0] is event name
            );
            receipt.events.NewOrder = receipt.events[0];
            receipt.events.NewOrder.returnValues = decodedArgs;
            return { orderId: decodedArgs.orderId };
        };
    }

    const transactionHash = await processTx(tx, txName, gasEstimate, onReceipt);
    return { txName, transactionHash };
}

export async function matchOrdersTx(buyId, sellId) {
    const txName = "Match orders";
    const gasEstimate = cost.MATCH_ORDERS_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = store.getState().contracts.latest.exchange.web3ContractInstance;

    const tx = exchange.methods.matchOrders(buyId, sellId).send({ from: userAccount, gas: gasEstimate });

    const transactionHash = await processTx(tx, txName, gasEstimate);

    return { txName, transactionHash };
}

export async function matchMultipleOrdersTx() {
    const txName = "Match orders";
    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = store.getState().contracts.latest.exchange.web3ContractInstance;
    const bn_ethFiatRate = store.getState().rates.info.bn_ethFiatRate;
    const orders = store.getState().orders.orders;
    const lowestSellPrice = orders.sellOrders[0].price;
    const highestBuyPrice = orders.buyOrders[0].price;

    const buyOrders = orders.buyOrders
        .filter(o => o.price >= lowestSellPrice)
        .map(o => ({ id: o.id, price: o.price, bn_ethAmount: o.bn_ethAmount }));
    const sellOrders = orders.sellOrders
        .filter(o => o.price <= highestBuyPrice)
        .map(o => ({ id: o.id, price: o.price, bn_tokenAmount: new BigNumber(o.amount) }));

    const sellIds = [];
    const buyIds = [];
    let buyIdx = 0;
    let sellIdx = 0;
    let matchCount = 0;
    while (
        buyIdx < buyOrders.length &&
        sellIdx < sellOrders.length &&
        buyOrders[buyIdx].price >= sellOrders[sellIdx].price && // we already filtered but just in case...
        matchCount < 100 // to make sure gas cost won't be over block gas limit even in edge scenarios
    ) {
        matchCount++;
        const sellOrder = sellOrders[sellIdx];
        const buyOrder = buyOrders[buyIdx];
        sellIds.push(sellOrder.id);
        buyIds.push(buyOrder.id);

        let tradedEth;
        let tradedTokens;

        const matchPrice = buyOrder.id > sellOrder.id ? sellOrder.price : buyOrder.price;

        buyOrder.bn_tokenValue = bn_ethFiatRate
            .div(matchPrice)
            .mul(buyOrder.bn_ethAmount)
            .round(2);

        sellOrder.bn_ethValue = sellOrder.bn_tokenAmount
            .mul(matchPrice)
            .div(bn_ethFiatRate)
            .round(18);

        if (sellOrder.bn_tokenAmount.lt(buyOrder.bn_tokenValue)) {
            tradedEth = sellOrder.bn_ethValue;
            tradedTokens = sellOrder.bn_tokenAmount;
        } else {
            tradedEth = buyOrder.bn_ethAmount;
            tradedTokens = buyOrder.bn_tokenValue;
        }

        buyOrder.bn_ethAmount = buyOrder.bn_ethAmount.sub(tradedEth);
        buyOrder.bn_tokenValue = buyOrder.bn_tokenValue.sub(tradedTokens);

        if (buyOrder.bn_ethAmount.eq(0)) {
            buyIdx++;
        }

        sellOrder.bn_ethValue = sellOrder.bn_ethValue.sub(tradedEth);
        sellOrder.bn_tokenAmount = sellOrder.bn_tokenAmount.sub(tradedTokens);
        if (sellOrder.bn_tokenAmount.eq(0)) {
            sellIdx++;
        }
    }

    if (matchCount === 0) {
        throw new Error("no matching orders found"); // UI shouldn't allow to be called in this case
    }

    const gasEstimate =
        cost.MATCH_MULTIPLE_FIRST_MATCH_GAS + cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS * (matchCount - 1);

    console.debug(
        "matchMultipleOrdersTx matchCount:",
        matchCount,
        "gasEstimate:",
        gasEstimate,
        "Buy: ",
        buyIds,
        "Sell:",
        sellIds
    );

    // for debugging
    // buyOrders.forEach(order => {
    //     order.ethAmount = order.bn_ethAmount.toString();
    //     order.tokenValue = order.bn_tokenValue ? order.bn_tokenValue.toString() : "NEVER REACHED";
    // });
    // sellOrders.forEach(order => {
    //     order.tokenAmount = order.bn_tokenAmount.toString();
    //     order.ethValue = order.bn_ethValue ? order.bn_ethValue.toString() : "NEVER REACHED";
    // });

    const tx = exchange.methods.matchMultipleOrders(buyIds, sellIds).send({ from: userAccount, gas: gasEstimate });

    const transactionHash = await processTx(tx, txName, gasEstimate);

    return { txName, transactionHash };
}

export async function cancelOrderTx(exchange, orderDirection, orderId) {
    const gasEstimate = cost.CANCEL_ORDER_GAS;
    const userAccount = store.getState().web3Connect.userAccount;

    let tx;
    let txName;
    if (orderDirection === TOKEN_BUY) {
        tx = exchange.methods.cancelBuyTokenOrder(orderId).send({ from: userAccount, gas: gasEstimate });
        txName = "Cancel buy order";
    } else if (orderDirection === TOKEN_SELL) {
        tx = exchange.methods.cancelSellTokenOrder(orderId).send({ from: userAccount, gas: gasEstimate });
        txName = "Cancel sell order";
    } else {
        throw new EthereumTransactionError(
            "Order cancel error.",
            "invalid orderDirection: " + orderDirection,
            null,
            gasEstimate
        );
    }

    const transactionHash = await processTx(tx, txName, gasEstimate);

    return { txName, transactionHash };
}
