import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { fetchAllLoans } from "modules/reducers/metricsManagers";

let isWatchSetup = false;

export default () => {
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("web3Connect.isConnected", onWeb3Connect);
    }

    return;
};

const onWeb3Connect = () => {
    console.debug("Dispatching fetchActiveLegacyLoans() ");

    store.dispatch(fetchAllLoans());
};
