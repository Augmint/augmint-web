import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyBalances } from "modules/reducers/legacyBalances";

export default () => {
    const web3Connect = store.getState().web3Connect;

    if (web3Connect.isConnected) {
        console.debug("legacyBalancesProvider - web3 already connected, dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
    }

    const monetarySupervisor = store.getState().monetarySupervisor;

    if (monetarySupervisor.isConnected) {
        setupListeners();
    }

    setupWatch("monetarySupervisor.contract", onMonetarySupervisorContractChange);
    setupWatch("web3Connect.userAccount", onUserAccountChange);

    return;
};

const onMonetarySupervisorContractChange = (newVal, oldVal) => {
    if (newVal && store.getState().augmintToken.isConnected) {
        setupListeners();
    }
};

const setupListeners = () => {
    const monetarySupervisor = store.getState().monetarySupervisor.contract.ethersInstance;
    monetarySupervisor.onlegacytokenconverted = onLegacyTokenConverted;
};

const onLegacyTokenConverted = (oldTokenAddress, account, amount) => {
    const userAccount = store.getState().web3Connect.userAccount;
    if (account.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "legacyBalancesProvider - LegacyTokenConverted event received for current user account. Dispatching refreshLegacyBalances()"
        );
        store.dispatch(refreshLegacyBalances());
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (newVal !== "?") {
        console.debug("legacyBalancesProvider - web3Connect.userAccount changed. Dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
    }
};
