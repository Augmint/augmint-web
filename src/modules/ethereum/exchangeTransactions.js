import store from "modules/store";
import BigNumber from "bignumber.js";
import { cost } from "./gas";
import { EthereumTransactionError, processTx } from "modules/ethereum/ethHelper";

import {
    ONE_ETH_IN_WEI,
    DECIMALS_DIV,
    PPM_DIV,
    DECIMALS,
    LEGACY_CONTRACTS_CHUNK_SIZE,
    CHUNK_SIZE
} from "utils/constants";

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

    // result format: [id, maker,  price, amount]
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

                if (orderDirection === TOKEN_BUY) {
                    parsed.direction = TOKEN_BUY;
                    parsed.tokenValue = parseFloat(
                        parsed.bn_amount
                            .mul(parsed.bn_price)
                            .div(ONE_ETH_IN_WEI)
                            .round(0, BigNumber.ROUND_HALF_DOWN)
                            .div(DECIMALS_DIV)
                            .toFixed(DECIMALS)
                    );
                    parsed.bn_weiValue = parsed.bn_amount;
                } else {
                    parsed.direction = TOKEN_SELL;
                    parsed.tokenValue = parseFloat(parsed.bn_amount / DECIMALS_DIV);
                    parsed.bn_weiValue = parsed.bn_amount
                        .mul(ONE_ETH_IN_WEI)
                        .div(parsed.bn_price)
                        .round(0, BigNumber.ROUND_HALF_UP);
                }

                parsed.price = parsed.bn_price / PPM_DIV;
                parsed.bn_ethValue = parsed.bn_weiValue.div(ONE_ETH_IN_WEI);
                parsed.ethValue = parsed.bn_ethValue.toString();
                parsed.ethValueRounded = parseFloat(parsed.bn_ethValue.toFixed(6));

                if (orderDirection === TOKEN_BUY) {
                    parsed.amount = parsed.ethValue;
                    parsed.amountRounded = parsed.ethValueRounded;
                    res.buyOrders.push(parsed);
                } else {
                    parsed.amount = parsed.tokenValue;
                    parsed.amountRounded = parsed.tokenValue;
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
