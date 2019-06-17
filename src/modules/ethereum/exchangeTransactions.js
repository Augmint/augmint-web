import store from "modules/store";
import { cost } from "./gas";
import { processTx, sendAndProcessTx } from "modules/ethereum/ethHelper";

import { Tokens } from "@augmint/js";

export async function fetchOrders() {
    const exchange = await store.getState().web3Connect.augmint.exchange;

    const orderBook = await exchange.getOrderBook();

    return orderBook;
}

export async function placeOrderTx(buy, amount, price) {
    const exchange = await store.getState().web3Connect.augmint.exchange;

    const tx = buy ? exchange.placeBuyTokenOrder(price, amount) : exchange.placeSellTokenOrder(price, amount);

    const txName = buy ? "Buy token order" : "Sell token order";

    let onReceipt;
    if (!buy) {
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

    return { txName, transactionHash };
}

export async function cancelOrderTx(exchange, buy, orderId) {
    const gasEstimate = cost.CANCEL_ORDER_GAS;
    const userAccount = store.getState().web3Connect.userAccount;

    const txName = buy ? "Cancel buy order" : "Cancel sell order";
    const tx = buy
        ? exchange.methods.cancelBuyTokenOrder(orderId).send({ from: userAccount, gas: gasEstimate })
        : exchange.methods.cancelSellTokenOrder(orderId).send({ from: userAccount, gas: gasEstimate });

    const transactionHash = await processTx(tx, txName, gasEstimate);

    return { txName, transactionHash };
}

export function getSimpleBuyCalc(token, isBuy, rate) {
    const orderBook = store.getState().orders.orders;

    let result;

    try {
        if (isBuy) {
            result = orderBook.estimateMarketBuy(Tokens.of(token), Tokens.of(rate));
        } else {
            result = orderBook.estimateMarketSell(Tokens.of(token), Tokens.of(rate));
        }
    } catch (error) {
        return;
    }
    return result;
}
