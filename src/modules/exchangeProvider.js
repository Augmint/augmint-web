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
        isWatchSetup = true;
        setupWatch("contracts.latest.exchange", onExchangeContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }

    return;
};

const setupListeners = () => {
    const exchange = store.getState().contracts.latest.exchange.ethersInstance;
    exchange.onneworder = onNewOrder;
    exchange.onorderfill = onOrderFill;
    exchange.oncancelledorder = onCancelledOrder;
};

const refresh = () => {
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());

    const userAccount = store.getState().web3Connect.userAccount;
    const exchange = store.getState().contracts.latest.exchange;

    store.dispatch(fetchTrades(userAccount, exchange.deployedAtBlock, "latest"));
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const exchange = store.getState().contracts.latest.exchange;
    if (exchange && newVal !== "?") {
        console.debug(
            "exchangeProvider - web3Connect.userAccount changed. Dispatching refreshExchange(), refreshOrders() and fetchTrades()"
        );
        refresh();
    }
};

const onExchangeContractChange = (newVal, oldVal, objectPath) => {
    if (newVal) {
        console.debug(
            "exchangeProvider - new Exchange contract. Dispatching refreshExchange(), refreshOrders() and fetchTrades()"
        );
        refresh();
        setupListeners();
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
    publishedRate,
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
        console.log("THIS buy: ", this);
    }
    if (userAccount.toLowerCase() === tokenSeller.toLowerCase()) {
        store.dispatch(processNewTrade("OrderFill", userAccount, this, "sell"));
        console.log("THIS sell: ", this);
    }
    if (tokenSeller.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "exchangeProvider.onOrderFill: sell token order filled for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};
