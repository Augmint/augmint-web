import store from "modules/store";
import { setupWatch } from "./initialFunctions.js";
import { fetchAllData } from "modules/reducers/metrics";

let isWatchSetup = false;

export default () => {
    onLoaded();

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.isConnected", onLoaded);
        setupWatch("augmintToken.isLoaded", onLoaded);
        setupWatch("monetarySupervisor.isLoaded", onLoaded);
    }

    return;
};

const onLoaded = () => {
    const ready =
        store.getState().contracts.isConnected &&
        store.getState().augmintToken.isLoaded &&
        store.getState().monetarySupervisor.isLoaded;

    if (ready) {
        console.debug("metricsProvider - contracts.isConnected changed: Dispatching fetchActiveLegacyLoans() ");
        store.dispatch(fetchAllData());
    }
};
