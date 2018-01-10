import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectRates, refreshRates } from "modules/reducers/rates";

export default () => {
    const rates = store.getState().rates;
    const web3Connect = store.getState().web3Connect;

    if (!rates.isLoading && !rates.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("augmintToken.contract", onAugmintTokenContractChange);
        setupWatch("rates.contract", onRatesContractChange);

        if (web3Connect.isConnected) {
            console.debug(
                "ratesProvider - rates not connected or loading and web3 already connected, dispatching connectRates() "
            );
            store.dispatch(connectRates());
        }
    }
    return;
};

const setupListeners = () => {
    const rates = store.getState().rates.contract.instance;
    rates.RateChanged({ fromBlock: "latest", toBlock: "pending" }).watch(onRateChange);
};

const removeListeners = oldInstance => {
    if (oldInstance && oldInstance.instance) {
        oldInstance.instance.RateChanged().stopWatching();
    }
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal !== null) {
        console.debug("ratesProvider - web3Connect.network changed. Dispatching connectRates()");
        store.dispatch(connectRates());
    }
};

const onAugmintTokenContractChange = (newVal, oldVal, objectPath) => {
    refreshRatesIfNeeded(newVal, oldVal);
};

const onRatesContractChange = (newVal, oldVal, objectPath) => {
    refreshRatesIfNeeded(newVal, oldVal);
};

const refreshRatesIfNeeded = (newVal, oldVal) => {
    removeListeners(oldVal);
    if (newVal && store.getState().augmintToken.isConnected) {
        console.debug("ratesProvider - new rates or augmintToken contract. Dispatching refreshRates()");
        store.dispatch(refreshRates());
        setupListeners();
    }
};

const onRateChange = (error, result) => {
    console.debug("ratesProvider.onRateChange(): RateChange event. Dispatching refreshRates()");
    store.dispatch(refreshRates());
};
