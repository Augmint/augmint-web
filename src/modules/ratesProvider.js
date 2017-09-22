import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectRates, refreshRates } from "modules/reducers/rates";

export default () => {
    const rates = store.getState().rates;
    const web3Connect = store.getState().web3Connect;

    if (!rates.isLoading && !rates.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("rates.contract", onRatesContractChange);
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
    if (oldInstance && oldInstance.instance) {
        oldInstance.instance.e_ethToUsdcChanged().stopWatching();
    }
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal !== null) {
        console.debug(
            "ratesProvider - web3Connect.network changed. Dispatching connectRates()"
        );
        store.dispatch(connectRates());
    }
};

const onRatesContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug(
            "ratesProvider - rates.contract changed. Dispatching refreshRates()"
        );
        store.dispatch(refreshRates());
        setupListeners();
    }
};

const onRateChange = (error, result) => {
    console.debug(
        "ratesProvider.onRateChange(): e_ethToUsdcChanged event. Dispatching refreshRates"
    );
    store.dispatch(refreshRates());
};
