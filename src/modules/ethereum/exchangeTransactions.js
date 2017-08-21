import store from "modules/store";
import BigNumber from "bignumber.js";

export async function fetchOrders() {
    // FIXME: what to do if orders changes while iterating?
    try {
        let exchange = store.getState().exchange.contract.instance;
        let web3 = store.getState().web3Connect.web3Instance;
        let orders = [];
        let order = await exchange.iterateOpenOrders(0); // returns first open order
        let nextOrderId = 999;
        while (order[0] > 0 && nextOrderId > 0) {
            let orderType = order[3];
            let bn_amount, ccy;
            if (orderType === 0) {
                ccy = "UCD";
                bn_amount = order[4].div(new BigNumber(10000));
            } else {
                ccy = "ETH";
                bn_amount = web3.fromWei(new BigNumber(order[4]));
            }
            let amount = bn_amount.toString();
            orders.push({
                orderId: order[0].toNumber(),
                maker: order[1],
                makerOrderIdx: order[2].toNumber(),
                orderType: orderType,
                bn_amount: bn_amount,
                amount: amount,
                ccy: ccy
            });

            nextOrderId = order[5];
            if (nextOrderId > 0) {
                order = await exchange.iterateOpenOrders(nextOrderId);
            }
        }
        return orders;
    } catch (error) {
        throw new Error("fetchOrders failed.\n" + error);
    }
}
