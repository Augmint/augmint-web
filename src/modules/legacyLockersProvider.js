import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyLockers } from "modules/reducers/legacyLockers";

let isWatchSetup = false;

export default () => {
    const legacyLockers = store.getState().legacyLockers;

    if (legacyLockers && !legacyLockers.isLoaded && legacyLockers.isLoading) {
        console.debug("legacyLockersProvider - first time. Dispatching refreshLegacyLockers() ");
        store.dispatch(refreshLegacyLockers());
        setupListeners();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.lockManager", onLockContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }

    return;
};

const onLockContractChange = (newVal, oldVal) => {
    console.debug("legacyLockersProvider - Locker changed. Dispatching refreshLegacyLockers() ");
    store.dispatch(refreshLegacyLockers());
    setupListeners();
};

const setupListeners = () => {
    // TODO: listen to repay event
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (store.getState().contracts.latest.monetarySupervisor && newVal !== "?") {
        console.debug("legacyLockersProvider - web3Connect.userAccount changed. Dispatching refreshLegacyLockers() ");
        store.dispatch(refreshLegacyLockers());
    }
};
