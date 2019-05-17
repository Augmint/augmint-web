import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLegacyBalances } from "modules/reducers/legacyBalances";

let isWatchSetup = false;
let processedContractEvents; //** map of eventIds processed: Workaround for bug that web3 beta 36 fires events 2x with MetaMask */

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
    processedContractEvents = {};

    // TODO: use augmint-js class when augmint-js exposes it
    const monetarySupervisor = store.getState().contracts.latest.monetarySupervisor.web3ContractInstance;
    monetarySupervisor.events.LegacyTokenConverted({}, (error, event) => {
        // Workaround for bug that web3 beta 36 fires events 2x with MetaMask TODO: check with newer web3 versions if fixed
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            const userAccount = store.getState().web3Connect.userAccount;

            if (event.returnValues.account.toLowerCase() === userAccount.toLowerCase()) {
                console.debug(
                    "legacyBalancesProvider - LegacyTokenConverted event received for current user account. Dispatching refreshLegacyBalances()"
                );
                store.dispatch(refreshLegacyBalances());
            }
        }
    });
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    if (store.getState().contracts.latest.monetarySupervisor && newVal !== "?") {
        console.debug("legacyBalancesProvider - web3Connect.userAccount changed. Dispatching refreshLegacyBalances() ");
        store.dispatch(refreshLegacyBalances());
    }
};
