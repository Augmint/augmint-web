import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { fetchAllLoans } from "modules/reducers/metrics";

let isWatchSetup = false;

export default () => {
    const contractsIsConnected = store.getState().contracts.isConnected;

    if (contractsIsConnected) {
        // when navigating from a page where already connected
        onContractsIsConnectedChange();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.isConnected", onContractsIsConnectedChange);
    }

    return;
};

const onContractsIsConnectedChange = () => {
    const contractsIsConnected = store.getState().contracts.isConnected;
    if (contractsIsConnected) {
        console.debug("metricsProvider - contracts.isConnected changed: Dispatching fetchActiveLegacyLoans() ");
        store.dispatch(fetchAllLoans());
    }
};
