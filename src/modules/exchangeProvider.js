import store from "modules/store";
import watch from "redux-watch";
import { connectExchange, refreshExchange } from "modules/reducers/exchange";
import { fetchUserBalance } from "modules/reducers/userBalances";
import { refreshOrders } from "modules/reducers/orders";
import { ETHSELL, UCDSELL } from "modules/reducers/orders";
/*
    TODO: make it to a HOC
*/
let w1Unsubscribe, w2Unsubscribe;

export default () => {
    const exchange = store.getState().exchange;
    const web3Connect = store.getState().web3Connect;

    if (!exchange.isLoading && !exchange.isConnected) {
        setupWatches();
        if (web3Connect.isConnected) {
            console.debug(
                "exchangeProvider - exchange not connected or loading and web3 alreay loaded, dispatching connectExchange() "
            );
            store.dispatch(connectExchange());
        }
    }
    return;
};

const setupListeners = () => {
    const exchange = store.getState().exchange.contract.instance;
    exchange
        .e_newOrder({ fromBlock: "latest", toBlock: "pending" })
        .watch(onNewOrder);
    exchange
        .e_orderFill({ fromBlock: "latest", toBlock: "pending" })
        .watch(onOrderFill);
};

const removeListeners = oldInstance => {
    if (oldInstance.instance) {
        oldInstance.instance.e_newOrder().stopWatching();
        oldInstance.instance.e_orderFill().stopWatching();
    }
};

const setupWatches = () => {
    let w1 = watch(store.getState, "web3Connect.web3ConnectionId");
    let unsubscribe = store.subscribe(
        w1((newVal, oldVal, objectPath) => {
            if (w1Unsubscribe) {
                w1Unsubscribe();
                removeListeners(oldVal);
            }
            w1Unsubscribe = unsubscribe;
            if (newVal !== null) {
                console.debug(
                    "exchangeProvider - web3Connect.web3ConnectionId changed. Dispatching connectExchange()"
                );

                store.dispatch(connectExchange());
            }
        })
    );

    let w2 = watch(store.getState, "exchange.contract");
    unsubscribe = store.subscribe(
        w2((newVal, oldVal, objectPath) => {
            if (w2Unsubscribe) {
                w2Unsubscribe();
                removeListeners(oldVal);
            }
            w2Unsubscribe = unsubscribe;
            if (newVal) {
                console.debug(
                    "exchangeProvider - exchange.contract changed. Dispatching refreshExchange()"
                );
                store.dispatch(refreshExchange());
                store.dispatch(refreshOrders());
                setupListeners();
            }
        })
    );
};

// event e_newOrder(uint orderId, OrdersLib.OrderType orderType, address maker, uint amount);
const onNewOrder = (error, result) => {
    console.debug(
        "exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()"
    );
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    let userAccount = store.getState().web3Connect.userAccount;
    if (
        result.args.maker === userAccount &&
        result.args.orderType.toNumber() === ETHSELL
    ) {
        console.debug(
            "exchangeProvider.onNewOrder: e_NewOrder ETHSELL and maker is userAccount. Dispatching fetchUserBalance"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// event e_orderFill(uint orderId, OrdersLib.OrderType orderType, address maker, address taker, uint amountSold, uint amountPaid);
const onOrderFill = (error, result) => {
    console.debug(
        "exchangeProvider.onOrderFill: dispatching refreshExchange()"
    );
    // FIXME: shouldn't do refresh for each orderFill event becuase multiple orderFills emmitted for one new order
    //          but newOrder is not emmited when a sell fully covered by orders and
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    let userAccount = store.getState().web3Connect.userAccount;
    if (
        (result.args.maker === userAccount &&
            result.args.orderType.toNumber() === ETHSELL) ||
        (result.args.taker === userAccount && result.args.orderType === UCDSELL)
    ) {
        console.debug(
            "exchangeProvider.onOrderFill: e_orderFill ETHSELL/UCDSELL and maker/taker is userAccount. Dispatching fetchUserBalance"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};
