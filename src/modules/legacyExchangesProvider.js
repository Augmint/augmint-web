import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyExchanges } from "modules/reducers/legacyExchanges";

let isWatchSetup = false;

export default () => {
    const legacyBalances = store.getState().legacyBalances;

    if (legacyBalances && !legacyBalances.isLoaded && legacyBalances.isLoading) {
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
    const monetarySupervisor = store.getState().contracts.latest.monetarySupervisor.ethersInstance;
    monetarySupervisor.onlegacytokenconverted = onLegacyTokenConverted;
};

// TODO:
const onLegacyTokenConverted = (oldTokenAddress, account, amount) => {
    const userAccount = store.getState().web3Connect.userAccount;
    if (account.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "legacyExchangesProvider - LegacyTokenConverted event received for current user account. Dispatching refreshLegacyExchanges()"
        );
        store.dispatch(refreshLegacyExchanges());
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (store.getState().contracts.latest.monetarySupervisor && newVal !== "?") {
        console.debug(
            "legacyExchangesProvider - web3Connect.userAccount changed. Dispatching refreshLegacyExchanges() "
        );
        store.dispatch(refreshLegacyExchanges());
    }
};
