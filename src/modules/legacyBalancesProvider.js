import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyBalances } from "modules/reducers/legacyBalances";

export default () => {
    const web3Connect = store.getState().web3Connect;

    if (web3Connect.isConnected) {
        console.debug("legacyBalancesProvider - web3 already connected, dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
    }

    setupWatch("web3Connect.userAccount", onUserAccountChange);

    return;
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (newVal !== "?") {
        console.debug("legacyBalancesProvider - web3Connect.userAccount changed. Dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
    }
};
