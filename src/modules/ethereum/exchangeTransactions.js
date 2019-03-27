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

    return o1.price * dir > o2.price * dir || (o1.price === o2.price && o1.id > o2.id) ? 1 : -1;
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
    const blockGasLimit = Math.floor(store.getState().web3Connect.info.gasLimit * 0.9); // gasLimit was read at connection time, prepare for some variance
    const exchange = store.getState().contracts.latest.exchange.web3ContractInstance;
    const bn_ethFiatRate = store.getState().rates.info.bn_ethFiatRate;
    const orders = store.getState().orders.orders;

    const matches = calculateMatchingOrders(orders.buyOrders, orders.sellOrders, bn_ethFiatRate, blockGasLimit);

    if (matches.sellIds.length === 0) {
        throw new Error("no matching orders found"); // UI shouldn't allow to be called in this case
    }

    console.debug(`matchMultipleOrdersTx matchCount: ${matches.sellIds.length} gasEstimate: ${matches.gasEstimate}
        Buy: ${matches.buyIds}
        Sell: ${matches.sellIds}`);

    const tx = exchange.methods
        .matchMultipleOrders(matches.buyIds, matches.sellIds)
        .send({ from: userAccount, gas: matches.gasEstimate });

    const transactionHash = await processTx(tx, txName, matches.gasEstimate);

    return { txName, transactionHash };
}

/*********************************************************************************
calculateMatchingOrders(_buyOrders, _sellOrders, bn_ethFiatRate, gasLimit)
returns matching pairs from ordered ordebook for sending in Exchange.matchMultipleOrders ethereum tx
    input:
        buyOrders[ { id, price, bn_ethAmount }]
            must be ordered by price descending then by id ascending
        sellOrders[ {id, price, amount }]
            must be ordered by price ascending then by id ascending
        bn_ethFiatRate:
            current ETHEUR rate
        gasLimit:
            return as many matches as it fits to gasLimit based on gas cost estimate.
            returns all matches if 0 passed for gasLimit

    returns: pairs of matching order id , ordered by execution sequence
        { buyIds: [], sellIds: [], gasEstimate }
*********************************************************************************/
export function calculateMatchingOrders(_buyOrders, _sellOrders, bn_ethFiatRate, gasLimit) {
    const sellIds = [];
    const buyIds = [];

    if (_buyOrders.length === 0 || _sellOrders.length === 0) {
        return [buyIds, sellIds];
    }
    const lowestSellPrice = _sellOrders[0].price;
    const highestBuyPrice = _buyOrders[0].price;

    const buyOrders = _buyOrders
        .filter(o => o.price >= lowestSellPrice)
        .map(o => ({ id: o.id, price: o.price, bn_ethAmount: o.bn_ethAmount }));
    const sellOrders = _sellOrders
        .filter(o => o.price <= highestBuyPrice)
        .map(o => ({ id: o.id, price: o.price, bn_tokenAmount: new BigNumber(o.amount) }));

    let buyIdx = 0;
    let sellIdx = 0;
    let gasEstimateWithNextMatch = cost.MATCH_MULTIPLE_FIRST_MATCH_GAS;

    while (
        buyIdx < buyOrders.length &&
        sellIdx < sellOrders.length &&
        buyOrders[buyIdx].price >= sellOrders[sellIdx].price && // we already filtered but just in case...
        (gasEstimateWithNextMatch <= gasLimit || gasLimit === 0) // to make sure gas cost won't be over block gas limit even in edge scenarios
    ) {
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

        // console.debug(
        //     `MATCH:  BUY: id: ${buyOrder.id} price: ${
        //         buyOrder.price
        //     } Amount: ${buyOrder.bn_ethAmount.toString()} ETH tokenValue: ${buyOrder.bn_tokenValue.toString()}
        // SELL: id: ${sellOrder.id} price: ${
        //         sellOrder.price
        //     } Amount: ${sellOrder.bn_tokenAmount.toString()} AEUR  ethValue: ${sellOrder.bn_ethValue.toString()}
        // Traded: ${tradedEth.toString()} ETH <-> ${tradedTokens.toString()} AEUR @${(matchPrice * 100).toFixed(
        //         2
        //     )}% on ${bn_ethFiatRate.toString()} ETHEUR`
        // );

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

        gasEstimateWithNextMatch += cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS;
    }

    const gasEstimate =
        sellIds.length === 0
            ? 0
            : cost.MATCH_MULTIPLE_FIRST_MATCH_GAS + (sellIds.length - 1) * cost.MATCH_MULTIPLE_ADDITIONAL_MATCH_GAS;

    return { buyIds, sellIds, gasEstimate };
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
