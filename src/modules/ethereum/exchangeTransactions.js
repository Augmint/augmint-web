import store from "modules/store";
import BN from "bn.js";
import { cost } from "./gas";
import { EthereumTransactionError, processTx, sendAndProcessTx } from "modules/ethereum/ethHelper";

import { ONE_ETH_IN_WEI, DECIMALS_DIV, PPM_DIV } from "utils/constants";

export const TOKEN_BUY = 0;
export const TOKEN_SELL = 1;

export async function fetchOrders() {
    const exchange = await store.getState().web3Connect.augmint.exchange;

    const orderBook = await exchange.getOrderBook();

    return orderBook;
}

export async function placeOrderTx(orderDirection, amount, price) {
    const exchange = await store.getState().web3Connect.augmint.exchange;

    const submitPrice = new BN(price * PPM_DIV);
    let submitAmount;
    let tx;
    let txName;

    switch (orderDirection) {
        case TOKEN_BUY:
            submitAmount = new BN(ONE_ETH_IN_WEI * amount);
            txName = "Buy token order";
            tx = exchange.placeBuyTokenOrder(submitPrice, submitAmount);
            break;

        case TOKEN_SELL:
            submitAmount = new BN(amount * DECIMALS_DIV);
            txName = "Sell token order";
            tx = exchange.placeSellTokenOrder(submitPrice, submitAmount);
            break;

        default:
            throw new EthereumTransactionError(
                "Place order failed.",
                "Unknown orderDirection: " + orderDirection,
                null
            );
    }

    let onReceipt;
    if (orderDirection === TOKEN_SELL) {
        // tokenSell is called on AugmintToken and event emmitted from Exchange is not parsed by web3
        onReceipt = receipt => {
            const web3 = store.getState().web3Connect.web3Instance;
            const newOrderEventInputs = exchange.instance.options.jsonInterface.find(val => val.name === "NewOrder")
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

    const transactionHash = await sendAndProcessTx(tx, txName, onReceipt);
    return { txName, transactionHash };
}

export async function matchMultipleOrdersTx() {
    const txName = "Match orders";
    const exchange = await store.getState().web3Connect.augmint.exchange;

    const matchingOrders = await exchange.getMatchingOrders();

    if (matchingOrders.sellIds.length === 0) {
        throw new Error("no matching orders found"); // UI shouldn't allow to be called in this case
    }

    const tx = exchange.matchMultipleOrders(matchingOrders);
    const transactionHash = await sendAndProcessTx(tx, txName);

    console.debug(`matchMultipleOrdersTx matchCount: ${matchingOrders.sellIds.length} gasEstimate: ${
        matchingOrders.gasEstimate
    }
        Buy: ${matchingOrders.buyIds}
        Sell: ${matchingOrders.sellIds}`);

    // const receipt = tx.getConfirmedReceipt(20);
    // console.log("got confirmed rece", receipt);
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
