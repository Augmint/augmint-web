import store from "modules/store";
import { cost } from "./gas";
import { EthereumTransactionError } from "modules/ethereum/ethHelper";

export const TOKEN_BUY = 0;
export const TOKEN_SELL = 1;
const ONE_ETH = 1000000000000000000;

export async function fetchOrders() {
    // TODO: handle when order changes while iterating
    const exchange = store.getState().exchange;

    const orderCounts = await exchange.contract.instance.getActiveOrderCounts();
    const buyCount = orderCounts[0].toNumber();
    const sellCount = orderCounts[1].toNumber();
    // retreive all orders
    let buyOrders = [];
    let queryCount = Math.ceil(buyCount / exchange.info.chunkSize);
    for (let i = 0; i < queryCount; i++) {
        const fetchedOrders = await getOrders(TOKEN_BUY, i * exchange.info.chunkSize);
        buyOrders = buyOrders.concat(fetchedOrders.buyOrders);
    }

    let sellOrders = [];
    queryCount = Math.ceil(sellCount / exchange.info.chunkSize);
    for (let i = 0; i < queryCount; i++) {
        const fetchedOrders = await getOrders(TOKEN_SELL, i * exchange.info.chunkSize);
        sellOrders = sellOrders.concat(fetchedOrders.sellOrders);
    }

    return { buyOrders: buyOrders, sellOrders: sellOrders };
}

async function getOrders(orderType, offset) {
    const exchange = store.getState().exchange.contract.instance;
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;
    const decimals = store.getState().augmintToken.info.decimals;
    const blockGasLimit = Math.floor(store.getState().web3Connect.info.gasLimit * 0.9); // gasLimit was read at connection time, prepare for some variance

    let result;
    if (orderType === TOKEN_BUY) {
        result = await exchange.getActiveBuyOrders(offset, { gas: blockGasLimit });
    } else {
        result = await exchange.getActiveSellOrders(offset, { gas: blockGasLimit });
    }

    // result format: [id, maker,  price, amount]
    const orders = result.reduce(
        (res, order, idx) => {
            if (!order[3].eq(0)) {
                const parsed = {
                    id: order[0].toNumber(),
                    maker: "0x" + order[1].toString(16), // ethers.utils.hexlify(order[1].toString(16)),
                    bn_price: order[2],
                    bn_amount: order[3]
                };

                if (orderType === TOKEN_BUY) {
                    parsed.orderType = TOKEN_BUY;
                    parsed.tokenValue = parseFloat(
                        (parsed.bn_amount.mul(parsed.bn_price) / ONE_ETH / decimalsDiv).toFixed(decimals)
                    );
                    parsed.weiValue = parsed.bn_amount;
                } else {
                    parsed.orderType = TOKEN_SELL;
                    parsed.tokenValue = parseFloat(parsed.bn_amount / decimalsDiv);
                    parsed.weiValue = (parsed.bn_amount * ONE_ETH / parsed.bn_price).toFixed(0);
                }

                parsed.price = parsed.bn_price / decimalsDiv; // price in tokens/ETH
                parsed.ethValue = parsed.weiValue / ONE_ETH;
                parsed.ethValueRounded = parseFloat(parsed.ethValue.toFixed(6));

                if (orderType === TOKEN_BUY) {
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

    orders.buyOrders.sort((o1, o2) => isOrderBetter(o1, o2));
    orders.sellOrders.sort((o1, o2) => isOrderBetter(o1, o2));
    return orders;
}

export function isOrderBetter(o1, o2) {
    if (o1.orderType !== o2.orderType) {
        throw new Error("isOrderBetter(): ordertypes must be the same" + o1 + o2);
    }

    const dir = o1.orderType === TOKEN_SELL ? 1 : -1;
    return o1.price * dir > o2.price * dir || (o1.price === o2.price && o1.id > o2.id);
}

export async function placeOrderTx(orderType, amount, price) {
    const gasEstimate = cost.PLACE_ORDER_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = store.getState().exchange.contract.instance;
    const priceDecimalsDiv = store.getState().augmintToken.info.decimalsDiv; // Is it the same?

    let submitAmount;
    let result;

    switch (orderType) {
        case TOKEN_BUY:
            submitAmount = amount * ONE_ETH;
            result = await exchange.placeBuyTokenOrder(price * priceDecimalsDiv, {
                value: submitAmount,
                from: userAccount,
                gas: gasEstimate
            });
            break;
        case TOKEN_SELL:
            const augmintToken = store.getState().augmintToken;
            const decimalsDiv = augmintToken.info.decimalsDiv;
            submitAmount = amount * decimalsDiv;
            result = await augmintToken.contract.instance.transferAndNotify(
                exchange.address,
                submitAmount,
                price * priceDecimalsDiv,
                {
                    from: userAccount,
                    gas: gasEstimate
                }
            );
            break;
        default:
            throw new EthereumTransactionError(
                "Place order failed.",
                "Unknown orderType: " + orderType,
                result,
                gasEstimate
            );
    }

    if (result.receipt.gasUsed === gasEstimate) {
        // Neeed for testnet behaviour (TODO: test it!)
        throw new EthereumTransactionError(
            "Place order failed.",
            "All gas provided was used. Check tx.",
            result,
            gasEstimate
        );
    }

    if (
        !result.logs ||
        !result.logs[0] ||
        (result.logs[0].event !== "NewOrder" && result.logs[1].event !== "AugmintTransfer")
    ) {
        throw new EthereumTransactionError(
            "Place order failed.",
            "NewOrder or Augmint transfer event wasn't received. Check tx. ",
            result,
            gasEstimate
        );
    }

    return {
        eth: {
            gasEstimate,
            result
        }
    };
}

export async function matchOrdersTx(buyIndex, buyId, sellIndex, sellId) {
    const gasEstimate = cost.MATCH_ORDERS_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = store.getState().exchange.contract.instance;

    const result = await exchange.matchOrders(buyIndex, buyId, sellIndex, sellId, {
        from: userAccount,
        gas: gasEstimate
    });

    if (result.receipt.gasUsed === gasEstimate) {
        // Neeed for testnet behaviour (TODO: test it!)
        throw new EthereumTransactionError(
            "Order matching failed.",
            "All gas provided was used. Check tx",
            result,
            gasEstimate
        );
    }

    if (!result.logs || !result.logs[0] || result.logs[0].event !== "OrderFill") {
        throw new EthereumTransactionError(
            "Order matching failed.",
            "OrderFill event wasn't received. Check tx",
            result,
            gasEstimate
        );
    }

    return {
        eth: {
            gasEstimate,
            result
        }
    };
}

export async function cancelOrderTx(orderType, orderIndex, orderId) {
    const gasEstimate = cost.CANCEL_ORDER_GAS;
    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = store.getState().exchange.contract.instance;

    let result;
    if (orderType === TOKEN_BUY) {
        result = await exchange.cancelBuyTokenOrder(orderIndex, orderId, {
            from: userAccount,
            gas: gasEstimate
        });
    } else if (orderType === TOKEN_SELL) {
        result = await exchange.cancelSellTokenOrder(orderIndex, orderId, {
            from: userAccount,
            gas: gasEstimate
        });
    } else {
        throw new EthereumTransactionError(
            "Order cancel error.",
            "invalid orderType: " + orderType,
            result,
            gasEstimate
        );
    }

    if (result.receipt.gasUsed === gasEstimate) {
        // Neeed for testnet behaviour
        throw new EthereumTransactionError(
            "Order cancel error.",
            "All gas provided was used. Check tx. ",
            result,
            gasEstimate
        );
    }

    if (!result.logs || !result.logs[0] || result.logs[0].event !== "CancelledOrder") {
        throw new EthereumTransactionError(
            "Order cancel error.",
            "CancelledOrder event wasn't received. Check tx.",
            result,
            gasEstimate
        );
    }

    return {
        eth: {
            gasEstimate,
            result
        }
    };
}
