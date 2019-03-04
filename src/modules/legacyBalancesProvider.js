import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyBalances } from "modules/reducers/legacyBalances";

let isWatchSetup = false;

export default () => {
    const legacyBalances = store.getState().legacyBalances;

    if (legacyBalances && !legacyBalances.isLoaded && legacyBalances.isLoading) {
        console.debug("legacyBalancesProvider - first time. Dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
        setupListeners();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.monetarySupervisor", onMonetarySupervisorContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }

    return;
};

const onMonetarySupervisorContractChange = (newVal, oldVal) => {
    console.debug("legacyBalancesProvider - monetarySupervisor changed. Dispatching refreshLegacyBalances() ");
    store.dispatch(refreshLegacyBalances());
    setupListeners();
};

const setupListeners = () => {
    const monetarySupervisor = store.getState().contracts.latest.monetarySupervisor.ethersInstance;
    monetarySupervisor.on("LegacyTokenConverted", (...args) => {
        onLegacyTokenConverted(...args);
    });
};

const onLegacyTokenConverted = (oldTokenAddress, account, amount, eventObject) => {
    const userAccount = store.getState().web3Connect.userAccount;
    if (account.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "legacyBalancesProvider - LegacyTokenConverted event received for current user account. Dispatching refreshLegacyBalances()"
        );
        store.dispatch(refreshLegacyBalances());
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (store.getState().contracts.latest.monetarySupervisor && newVal !== "?") {
        console.debug("legacyBalancesProvider - web3Connect.userAccount changed. Dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
    }
};
