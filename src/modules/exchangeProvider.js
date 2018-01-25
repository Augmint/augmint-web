import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectExchange, refreshExchange } from "modules/reducers/exchange";
import { refreshOrders } from "modules/reducers/orders";
import { fetchUserBalance } from "modules/reducers/userBalances";

export default () => {
    const exchange = store.getState().exchange;
    const web3Connect = store.getState().web3Connect;

    if (!exchange.isLoading && !exchange.isConnected) {
        //setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("augmintToken.contract", onAugmintTokenContractChange);
        setupWatch("exchange.contract", onExchangeContractChange);
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
    exchange.NewOrder({ fromBlock: "latest", toBlock: "pending" }).watch(onNewOrder);
    exchange.OrderFill({ fromBlock: "latest", toBlock: "pending" }).watch(onOrderFill);
    exchange.CancelledOrder({ fromBlock: "latest", toBlock: "pending" }).watch(onCancelledOrder);
    exchange.MinOrderAmountChanged({ fromBlock: "latest", toBlock: "pending" }).watch(onMinOrderAmountChanged);
};

const removeListeners = oldInstance => {
    if (oldInstance && oldInstance.instance) {
        oldInstance.instance.NewOrder().stopWatching();
        oldInstance.instance.OrderFill().stopWatching();
        oldInstance.instance.CancelledOrder().stopWatching();
    }
};

// const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
//     removeListeners(oldVal);
//     if (newVal !== null) {
//         console.debug("exchangeProvider - web3Connect.network changed. Dispatching connectExchange()");
//         store.dispatch(connectExchange());
//     }
// };

const onAugmintTokenContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug("exchangeProvider - augmintToken contract changed. Dispatching connectExchange()");
        store.dispatch(connectExchange());
    }
};

const onExchangeContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal && store.getState().augmintToken.isConnected) {
        console.debug("exchangeProvider - new Exchange contract. Dispatching refreshOrders()");
        store.dispatch(refreshOrders());
        setupListeners();
    }
};

// NewOrder(uint orderIndex, uint indexed orderId, address indexed maker, uint price, uint tokenAmount, uint weiAmount);
const onNewOrder = (error, result) => {
    console.debug("exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()");
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    const userAccount = store.getState().web3Connect.userAccount;
    if (result.args.weiAmount.toString !== "0" && result.args.maker.toLowerCase() === userAccount.toLowerCase()) {
        // buy order, no Transfer is emmitted so onNewTransfer is not triggered
        console.debug(
            "exchangeProvider.onNewOrder: new buy tokenOrder for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// CancelledOrder(uint indexed orderId, address indexed maker, uint tokenAmount, uint weiAmount);
const onCancelledOrder = (error, result) => {
    console.debug("exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()");
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    const userAccount = store.getState().web3Connect.userAccount;
    if (result.args.weiAmount.toString !== "0" && result.args.maker.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "exchangeProvider.onCancelledOrder: cancelled buy tokenOrder for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// OrderFill(address indexed tokenBuyer, address indexed tokenSeller, uint buyTokenOrderId, uint sellTokenOrderId, uint price, uint weiAmount, uint tokenAmount);
const onOrderFill = (error, result) => {
    console.debug("exchangeProvider.onOrderFill: dispatching refreshExchange() and regreshOrders()");
    // FIXME: shouldn't do refresh for each orderFill event becuase multiple orderFills emmitted for one new order
    //          but newOrder is not emmited when a sell fully covered by orders and
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    const userAccount = store.getState().web3Connect.userAccount;
    if (result.args.tokenSeller.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "exchangeProvider.onOrderFill: sell token order filled for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// MinOrderAmountChanged(uint newMinOrderAmount);
const onMinOrderAmountChanged = (error, result) => {
    console.debug("exchangeProvider.onMinOrderAmountChanged: dispatching refreshExchange()");
    store.dispatch(refreshExchange());
};
