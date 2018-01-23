import store from "modules/store";
//import BigNumber from "bignumber.js";
import { cost } from "./gas";

export const TOKEN_BUY = 0;
export const TOKEN_SELL = 1;

export async function fetchOrders() {
    // TODO: handle when order changes while iterating
    try {
        const exchange = store.getState().exchange;
        const sellCount = exchange.info.sellOrderCount;
        const buyCount = exchange.info.buyOrderCount;
        // retreive all orders
        let buyOrders = [];
        let sellOrders = [];
        const queryCount = Math.ceil((sellCount + buyCount) / 50);
        for (let i = 0; i < queryCount; i++) {
            const fetchedOrders = await getOrders(i * 50);
            buyOrders = buyOrders.concat(fetchedOrders.buyOrders);
            sellOrders = sellOrders.concat(fetchedOrders.sellOrders);
        }
        return { buyOrders: buyOrders, sellOrders: sellOrders };
    } catch (error) {
        throw new Error("fetchOrders failed.\n" + error);
    }
}

async function getOrders(offset) {
    const exchange = store.getState().exchange.contract.instance;
    const result = await exchange.getOrders(offset);
    // result format: [maker] [id, addedTime, price, tokenAmount, weiAmount]
    const orders = result[0].reduce(
        (res, order, idx) => {
            if (order[2].toString() !== "0") {
                const parsed = {
                    index: order[0].toNumber(),
                    id: order[1].toNumber(),
                    addedTime: order[2],
                    price: order[3].toNumber(),
                    tokenAmount: order[4],
                    weiAmount: order[5],
                    maker: result[1][idx]
                };
                if (parsed.weiAmount.toString() !== "0") {
                    parsed.amount = parsed.weiAmount;
                    parsed.orderType = TOKEN_BUY;
                    res.buyOrders.push(parsed);
                } else {
                    parsed.amount = parsed.tokenAmount;
                    parsed.orderType = TOKEN_SELL;
                    res.sellOrders.push(parsed);
                }
            }

            return res;
        },
        { buyOrders: [], sellOrders: [] }
    );

    return orders;
}

export async function placeOrderTx(orderType, amount) {
    try {
        let gasEstimate = cost.PLACE_ORDER_GAS;
        let userAccount = store.getState().web3Connect.userAccount;
        let exchange = store.getState().exchange.contract.instance;
        let submitAmount, result;

        switch (orderType) {
            case TOKEN_BUY:
                let web3 = store.getState().web3Connect.web3Instance;
                submitAmount = web3.utils.toWei(amount.toString());
                result = await exchange.placeSellEthOrder({
                    value: submitAmount,
                    from: userAccount,
                    gas: gasEstimate
                });
                break;
            case TOKEN_SELL:
                let augmintToken = store.getState().augmintToken;
                submitAmount = amount.times(augmintToken.info.bn_decimalsDiv).toString(); // from truffle-contract 3.0.0 passing bignumber.js BN throws "Invalid number of arguments to Solidity function". should migrate to web3's BigNumber....
                result = await exchange.placeSellTokenOrder(submitAmount, {
                    from: userAccount,
                    gas: gasEstimate
                });
                break;
            default:
                throw new Error("Unknown orderType: " + orderType);
        }

        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("Place order failed. All gas provided was used:  " + result.receipt.gasUsed);
        }

        /* TODO:  process events properly for display (full new order, partly filled, fully filled) */

        if (
            !result.logs ||
            !result.logs[0] ||
            (result.logs[0].event !== "e_newOrder" && result.logs[0].event !== "e_orderFill")
        ) {
            throw new Error("e_newOrder or e_orderFill event wasn't received. Check tx :  " + result.tx);
        }

        //let bn_amount = result.logs[0].args.amount.div(new BigNumber(10000));
        return {
            txResult: result,
            orderId: "TODO",
            eth: {
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        console.error("Place order failed.\n", error);
        throw new Error("Place order failed.\n" + error);
    }
}
