import store from "modules/store";
import watch from "redux-watch";
import { connectRates, refreshRates } from "modules/reducers/rates";
/*
    TODO: make it to a HOC
*/
let w1Unsubscribe, w2Unsubscribe;

export default () => {
    const rates = store.getState().rates;
    const web3Connect = store.getState().web3Connect;

    if (!rates.isLoading && !rates.isConnected) {
        setupWatches();
        if (web3Connect.isConnected) {
            console.debug(
                "ratesProvider - rates not connected or loading and web3 alreay loaded, dispatching connectRates() "
            );
            store.dispatch(connectRates());
        }
    }
    return;
};

const setupListeners = () => {
    const rates = store.getState().rates.contract.instance;
    rates
        .e_ethToUsdcChanged({ fromBlock: "latest", toBlock: "pending" })
        .watch(onRateChange);
    // TODO: remove prev listeners
};

const removeListeners = oldInstance => {
    if (oldInstance.instance) {
        oldInstance.instance.e_ethToUsdcChanged().stopWatching();
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
                    "ratesProvider - web3Connect.web3ConnectionId changed. Dispatching connectRates()"
                );
                store.dispatch(connectRates());
            }
        })
    );

    let w2 = watch(store.getState, "rates.contract");
    unsubscribe = store.subscribe(
        w2((newVal, oldVal, objectPath) => {
            if (w2Unsubscribe) {
                w2Unsubscribe();
                removeListeners(oldVal);
            }
            w2Unsubscribe = unsubscribe;
            if (newVal) {
                console.debug(
                    "ratesProvider - rates.contract changed. Dispatching refreshRates()"
                );
                store.dispatch(refreshRates());
                setupListeners();
            }
        })
    );
};

const onRateChange = (error, result) => {
    console.debug(
        "ratesProvider.onRateChange(): e_ethToUsdcChanged event. Dispatching refreshRates"
    );
    store.dispatch(refreshRates());
};
