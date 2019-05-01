import store from "modules/store";
import BigNumber from "bignumber.js";
import { cost } from "./gas";
import { EthereumTransactionError, processTx } from "modules/ethereum/ethHelper";

import { ONE_ETH_IN_WEI, DECIMALS_DIV, PPM_DIV } from "utils/constants";

export const TOKEN_BUY = 0;
export const TOKEN_SELL = 1;

export async function fetchOrders() {
    const exchange = await store.getState().web3Connect.augmint.exchange;

    const orderBook = await exchange.getOrderBook();

    return orderBook;
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

export async function matchMultipleOrdersTx() {
    const txName = "Match orders";
    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = await store.getState().web3Connect.augmint.exchange;

    const matchingOrders = await exchange.getMatchingOrders();

    if (matchingOrders.sellIds.length === 0) {
        throw new Error("no matching orders found"); // UI shouldn't allow to be called in this case
    }

    const tx = exchange.matchMultipleOrders(matchingOrders).send({ from: userAccount });
    const transactionHash = await processTx(tx, txName, matchingOrders.gasEstimate);

    console.debug(`matchMultipleOrdersTx matchCount: ${matchingOrders.sellIds.length} gasEstimate: ${
        matchingOrders.gasEstimate
    }
        Buy: ${matchingOrders.buyIds}
        Sell: ${matchingOrders.sellIds}`);

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
