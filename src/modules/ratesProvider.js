import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshRates } from "modules/reducers/rates";

let isWatchSetup = false;
let processedContractEvents; //** map of eventIds processed: Workaround for bug that web3 beta 36 fires events 2x with MetaMask */

export default () => {
    const rates = store.getState().contracts.latest.rates;
    const ratesData = store.getState().rates;

    if (rates && !ratesData.isLoading && !ratesData.isLoaded) {
        console.debug("ratesProvider - first time. Dispatching refreshRates()");
        store.dispatch(refreshRates());
        setupContractEventListeners();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.rates", onRatesContractChange);
    }
};

const setupContractEventListeners = async () => {
    processedContractEvents = {};
    const rates = await store.getState().web3Connect.augmint.rates;

    rates.instance.events.RateChanged({}, (error, event) => {
        // RateChanged(bytes32 symbol, uint newRate)
        // Workaround for bug that web3 beta 36 fires events 2x with MetaMask TODO: check with newer web3 versions if fixed
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            console.debug("ratesProvider.onRateChange(): RateChange event. Dispatching refreshRates()");
            store.dispatch(refreshRates());
        }
    });
};

const onRatesContractChange = (newVal, oldVal, objectPath) => {
    console.debug("ratesProvider - new rates contract. Dispatching refreshRates()");
    store.dispatch(refreshRates());
    setupContractEventListeners();
};
