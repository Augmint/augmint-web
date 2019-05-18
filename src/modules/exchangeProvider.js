import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshExchange } from "modules/reducers/exchange";
import { fetchTrades, processNewTrade } from "modules/reducers/trades";
import { refreshOrders } from "modules/reducers/orders";
import { fetchUserBalance } from "modules/reducers/userBalances";

let isWatchSetup = false;
let processedContractEvents; //** map of eventIds processed: Workaround for bug that web3 beta 36 fires events 2x with MetaMask */

export default () => {
    const exchange = store.getState().contracts.latest.exchange;
    const exchangeData = store.getState().exchange;

    if (exchange && !exchangeData.isLoaded && !exchangeData.isLoading) {
        console.debug(
            "exchangeProvider - first time. Dispatching refreshExchange(), refreshOrders() and fetchTrades()"
        );
        refresh();
        setupContractEventListeners();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.exchange", onExchangeContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }

    return;
};

const setupContractEventListeners = async () => {
    processedContractEvents = {};
    const exchange = await store.getState().web3Connect.augmint.exchange;

    // processedContractEvents is a Workaround for bug that web3 beta 36 fires events 2x with MetaMask TODO: check with newer web3 versions if fixed
    exchange.instance.events.NewOrder({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            onNewOrder(error, event);
        }
    });

    exchange.instance.events.OrderFill({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            onOrderFill(error, event);
        }
    });

    exchange.instance.events.CancelledOrder({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            onCancelledOrder(error, event);
        }
    });
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
        setupContractEventListeners();
    }
};

// event NewOrder(uint indexed orderId, address indexed maker, uint price, uint tokenAmount, uint weiAmount);
const onNewOrder = (error, event) => {
    console.debug("exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()");
    store.dispatch(refreshExchange());
    // TODO: implement processOrder to avoid full orderBook reload
    store.dispatch(refreshOrders());

    const userAccount = store.getState().web3Connect.userAccount;

    if (userAccount.toLowerCase() === event.returnValues.maker.toLowerCase()) {
        store.dispatch(processNewTrade(userAccount, event));
    }

    if (
        event.returnValues.weiAmount.toString() !== "0" &&
        event.returnValues.maker.toLowerCase() === userAccount.toLowerCase()
    ) {
        // buy order, no Transfer is emmitted so onNewTransfer is not triggered
        console.debug(
            "exchangeProvider.onNewOrder: new buy tokenOrder for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// CancelledOrder(uint indexed orderId, address indexed maker, uint tokenAmount, uint weiAmount);
const onCancelledOrder = function(error, event) {
    console.debug("exchangeProvider.onNewOrder: dispatching refreshExchange() and refreshOrders()");
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());

    const userAccount = store.getState().web3Connect.userAccount;
    if (userAccount.toLowerCase() === event.returnValues.maker.toLowerCase()) {
        store.dispatch(processNewTrade(userAccount, event));
    }

    if (
        event.returnValues.weiAmount.toString() !== "0" &&
        event.returnValues.maker.toLowerCase() === userAccount.toLowerCase()
    ) {
        console.debug(
            "exchangeProvider.onCancelledOrder: cancelled buy tokenOrder for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// OrderFill(address indexed tokenBuyer, address indexed tokenSeller, uint buyTokenOrderId, uint sellTokenOrderId, uint price, uint weiAmount, uint tokenAmount);
const onOrderFill = function(error, event) {
    console.debug("exchangeProvider.onOrderFill: dispatching refreshExchange() and refreshOrders()");
    // FIXME: shouldn't do full refresh for each orderFill event rather queue them (multiuple Orderfills)
    store.dispatch(refreshExchange());
    store.dispatch(refreshOrders());

    const userAccount = store.getState().web3Connect.userAccount;
    if (userAccount.toLowerCase() === event.returnValues.tokenBuyer.toLowerCase()) {
        store.dispatch(processNewTrade(userAccount, event, "buy"));
    }

    if (userAccount.toLowerCase() === event.returnValues.tokenSeller.toLowerCase()) {
        store.dispatch(processNewTrade(userAccount, event, "sell"));
    }

    if (event.returnValues.tokenSeller.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "exchangeProvider.onOrderFill: sell token order filled for current user, dispatching fetchUserBalance()"
        );
        store.dispatch(fetchUserBalance(userAccount));
    }
};
