import store from "modules/store";
import { setupWatch } from "./initialFunctions.js";
import { refreshLegacyExchanges } from "modules/reducers/legacyExchanges";

let isWatchSetup = false;

export default () => {
    const legacyExchanges = store.getState().legacyExchanges;

    if (legacyExchanges && !legacyExchanges.isLoaded && legacyExchanges.isLoading) {
        console.debug("legacyExchangesProvider - first time. Dispatching refreshLegacyExchanges() ");
        store.dispatch(refreshLegacyExchanges());
        setupListeners();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.exchange", onExchangeContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }

    return;
};

const onExchangeContractChange = (newVal, oldVal) => {
    console.debug("legacyExchangesProvider - Exchange changed. Dispatching refreshLegacyExchanges() ");
    store.dispatch(refreshLegacyExchanges());
    setupListeners();
};

const setupListeners = () => {
    // TODO: refresh on order change
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (store.getState().contracts.latest.monetarySupervisor && newVal !== "?") {
        console.debug(
            "legacyExchangesProvider - web3Connect.userAccount changed. Dispatching refreshLegacyExchanges() "
        );
        store.dispatch(refreshLegacyExchanges());
    }
};
