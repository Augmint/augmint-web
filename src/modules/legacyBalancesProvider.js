import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyBalances } from "modules/reducers/legacyBalances";
import { patchEthersEvent } from "modules/ethereum/ethersHelper";

let isWatchSetup = false;

export default () => {
    const legacyBalances = store.getState().legacyBalances;

    if (legacyBalances && !legacyBalances.isLoaded && legacyBalances.isLoading) {
        console.debug("legacyBalancesProvider - first time. Dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
        setupContractEventListeners();
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
    setupContractEventListeners();
};

const setupContractEventListeners = () => {
    const monetarySupervisor = store.getState().contracts.latest.monetarySupervisor.ethersInstance;

    monetarySupervisor.on("LegacyTokenConverted", (...args) => {
        onLegacyTokenConverted(...args);
    });
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (store.getState().contracts.latest.monetarySupervisor && newVal !== "?") {
        console.debug("legacyBalancesProvider - web3Connect.userAccount changed. Dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
    }
};

const onLegacyTokenConverted = (oldTokenAddress, account, amount, ethersEvent) => {
    const event = patchEthersEvent(ethersEvent);

    const userAccount = store.getState().web3Connect.userAccount;

    if (event.returnValues.account.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "legacyBalancesProvider - LegacyTokenConverted event received for current user account. Dispatching refreshLegacyBalances()"
        );
        store.dispatch(refreshLegacyBalances());
    }
};
