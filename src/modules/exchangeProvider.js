import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshExchange } from "modules/reducers/exchange";
import { fetchTrades, processNewTrade } from "modules/reducers/trades";
import { refreshOrders } from "modules/reducers/orders";
import { fetchUserBalance } from "modules/reducers/userBalances";

let isWatchSetup = false;

export default () => {
    const exchange = store.getState().contracts.latest.exchange;
    const exchangeData = store.getState().exchange;

    if (exchange && !exchangeData.isLoaded && !exchangeData.isLoading) {
        console.debug(
            "exchangeProvider - first time. Dispatching refreshExchange(), refreshOrders() and fetchTrades()"
        );
        refresh();
        setupListeners();
    }

    if (!isWatchSetup) {
        console.log("**** DO WATCH SETP");
        // first time call of exchangeProvider
        isWatchSetup = true;
        setupWatch("contracts.latest.exchange", onExchangeContractChange);
    }

    return;
};

const setupListeners = () => {
    const exchange = store.getState().contracts.latest.exchange.ethersInstance;
    exchange.onneworder = onNewOrder;
    exchange.onorderfill = onOrderFill;
    exchange.oncancelledorder = onCancelledOrder;
};

const removeListeners = oldInstance => {
    // TODO: test if we need this with ethers
    // if (oldInstance && oldInstance.instance) {
    //     oldInstance.instance.NewOrder().stopWatching();
    //     oldInstance.instance.OrderFill().stopWatching();
    //     oldInstance.instance.CancelledOrder().stopWatching();
    // }
};

const refresh = () => {
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());

    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = store.getState().contracts.latest.exchange;

    store.dispatch(fetchTrades(userAccount, exchange.deployedAtBlock, "latest"));
};

const onExchangeContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug(
            "exchangeProvider - new Exchange contract. Dispatching refreshExchange(), refreshOrders() and fetchTrades()"
        );

        refresh();
    }
};

// event NewOrder(uint indexed orderId, address indexed maker, uint price, uint tokenAmount, uint weiAmount);
const onNewOrder = function(orderId, maker, price, tokenAmount, weiAmount) {
    console.debug("exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()");
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    const userAccount = store.getState().web3Connect.userAccount;
    if (userAccount.toLowerCase() === maker.toLowerCase()) {
        store.dispatch(processNewTrade("NewOrder", userAccount, this));
    }
    if (weiAmount.toString !== "0" && maker.toLowerCase() === userAccount.toLowerCase()) {
        // buy order, no Transfer is emmitted so onNewTransfer is not triggered
        console.debug(
            "exchangeProvider.onNewOrder: new buy tokenOrder for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// CancelledOrder(uint indexed orderId, address indexed maker, uint tokenAmount, uint weiAmount);
const onCancelledOrder = function(orderId, maker, tokenAmount, weiAmount) {
    console.debug("exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()");
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    const userAccount = store.getState().web3Connect.userAccount;
    if (userAccount.toLowerCase() === maker.toLowerCase()) {
        store.dispatch(processNewTrade("CancelledOrder", userAccount, this));
    }
    if (weiAmount.toString !== "0" && maker.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "exchangeProvider.onCancelledOrder: cancelled buy tokenOrder for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// OrderFill(address indexed tokenBuyer, address indexed tokenSeller, uint buyTokenOrderId, uint sellTokenOrderId, uint price, uint weiAmount, uint tokenAmount);
const onOrderFill = function(
    tokenBuyer,
    tokenSeller,
    buyTokenOrderId,
    sellTokenOrderId,
    price,
    weiAmount,
    tokenAmount
) {
    console.debug("exchangeProvider.onOrderFill: dispatching refreshExchange() and regreshOrders()");
    // FIXME: shouldn't do refresh for each orderFill event becuase multiple orderFills emmitted for one new order
    //          but newOrder is not emmited when a sell fully covered by orders and
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());
    const userAccount = store.getState().web3Connect.userAccount;
    if (userAccount.toLowerCase() === tokenBuyer.toLowerCase()) {
        store.dispatch(processNewTrade("OrderFill", userAccount, this, "buy"));
    }
    if (userAccount.toLowerCase() === tokenSeller.toLowerCase()) {
        store.dispatch(processNewTrade("OrderFill", userAccount, this, "sell"));
    }
    if (tokenSeller.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "exchangeProvider.onOrderFill: sell token order filled for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};
