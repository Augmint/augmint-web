import store from "modules/store";
import moment from "moment";
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
    const blockGasLimit = Math.floor(store.getState().web3Connect.info.gasLimit * 0.9); // gasLimit was read at connection time, prepare for some variance
    const result = await exchange.getOrders(offset, { gas: blockGasLimit });
    const web3 = store.getState().web3Connect.web3Instance;
    // result format: [maker] [id, addedTime, price, tokenAmount, weiAmount]
    const orders = result[0].reduce(
        (res, order, idx) => {
            if (order[2].toString() !== "0") {
                const parsed = {
                    index: order[0].toNumber(),
                    id: order[1].toNumber(),
                    addedTime: order[2].toNumber(),
                    bn_price: order[3],
                    tokenAmount: order[4],
                    weiAmount: order[5],
                    maker: result[1][idx]
                };
                parsed.addedTimeText = moment.unix(parsed.addedTime).format("D MMM YYYY HH:mm:ss");
                parsed.price = parsed.bn_price.div(10000).toNumber();

                if (parsed.weiAmount.toString() !== "0") {
                    parsed.amount = parseFloat(web3.utils.fromWei(parsed.weiAmount.toString()));
                    parsed.bn_amount = parsed.weiAmount;
                    parsed.orderType = TOKEN_BUY;
                    res.buyOrders.push(parsed);
                } else {
                    parsed.bn_amount = parsed.tokenAmount;
                    parsed.amount = parsed.tokenAmount.div(10000).toNumber();
                    parsed.orderType = TOKEN_SELL;
                    res.sellOrders.push(parsed);
                }
            }

            return res;
        },
        { buyOrders: [], sellOrders: [] }
    );

    orders.buyOrders.sort((o1, o2) => isOrderBetter(o1, o2));
    orders.sellOrders.sort((o1, o2) => isOrderBetter(o1, o2));
    return orders;
}

export function isOrderBetter(o1, o2) {
    if (o1.orderType !== o2.orderType) {
        throw new Error("isOrderBetter(): ordertypes must be the same" + o1 + o2);
    }

    const dir = o1.orderType === TOKEN_SELL ? 1 : -1;
    console.log(dir, o1.price, o2.price, o1.price * dir > o2.price * dir, o1.addedTime, o2.addedTime);
    return o1.price * dir > o2.price * dir || (o1.price === o2.price && o1.addedTime > o2.addedTime);
}

export async function placeOrderTx(orderType, amount, price) {
    try {
        const gasEstimate = cost.PLACE_ORDER_GAS;
        const userAccount = store.getState().web3Connect.userAccount;
        const exchange = store.getState().exchange.contract.instance;
        let submitAmount, result;

        switch (orderType) {
            case TOKEN_BUY:
                const web3 = store.getState().web3Connect.web3Instance;
                submitAmount = web3.utils.toWei(amount.toString());
                result = await exchange.placeBuyTokenOrder(price * 10000, {
                    value: submitAmount,
                    from: userAccount,
                    gas: gasEstimate
                });
                break;
            case TOKEN_SELL:
                const augmintToken = store.getState().augmintToken;
                submitAmount = amount.times(augmintToken.info.bn_decimalsDiv).toString(); // from truffle-contract 3.0.0 passing bignumber.js BN throws "Invalid number of arguments to Solidity function". should migrate to web3's BigNumber....
                result = await augmintToken.contract.instance.placeSellTokenOrderOnExchange(
                    exchange.address,
                    price * 10000,
                    submitAmount,
                    {
                        from: userAccount,
                        gas: gasEstimate
                    }
                );
                break;
            default:
                throw new Error("Unknown orderType: " + orderType);
        }

        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("Place order failed. All gas provided was used:  " + result.receipt.gasUsed);
        }

        if (
            !result.logs ||
            !result.logs[0] ||
            (result.logs[0].event !== "NewOrder" && result.logs[1].event !== "AugmintTransfer")
        ) {
            const error = new Error("NewOrder or Augmint transfer event wasn't received. Check tx :  " + result.tx);
            console.error(error, "\nResult received:", result);
            throw error;
        }

        return {
            txResult: result,
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
