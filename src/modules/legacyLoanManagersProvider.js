import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyLoanManagers } from "modules/reducers/legacyLoanManagers";

let isWatchSetup = false;

export default () => {
    const legacyLockers = store.getState().legacyLockers;

    if (legacyLockers && !legacyLockers.isLoaded && legacyLockers.isLoading) {
        console.debug("legacyLoanManagersProvider - first time. Dispatching refreshLegacyLoanManagers() ");
        store.dispatch(refreshLegacyLoanManagers());
        setupListeners();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.loanManager", onLoanManagerContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }

    return;
};

const onLoanManagerContractChange = (newVal, oldVal) => {
    console.debug("legacyLoanManagersProvider - LoanManager changed. Dispatching refreshLegacyLoanManagers() ");
    store.dispatch(refreshLegacyLoanManagers());
    setupListeners();
};

const setupListeners = () => {
    // TODO: listen to repay event
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (store.getState().contracts.latest.monetarySupervisor && newVal !== "?") {
        console.debug(
            "legacyLoanManagersProvider - web3Connect.userAccount changed. Dispatching refreshLegacyLoanManagers() "
        );
        store.dispatch(refreshLegacyLoanManagers());
    }
};
