import store from "modules/store";

export async function fetchOrders() {
    // FIXME: what to do if orders changes while iterating?
    try {
        let exchange = store.getState().exchange.contract.instance;
        let orders = [];
        let order = await exchange.iterateOpenOrders(0); // returns first open order
        let nextOrderId = 999;
        while (order[0] > 0 && nextOrderId > 0) {
            orders.push({
                orderId: order[0],
                makerOrderIdx: order[1],
                orderType: order[2],
                amount: order[3]
            });

            nextOrderId = order[4];
            if (nextOrderId > 0) {
                order = await exchange.iterateOpenOrders(nextOrderId);
            }
        }
        return orders;
    } catch (error) {
        throw new Error("fetchOrders failed.\n" + error);
    }
}
