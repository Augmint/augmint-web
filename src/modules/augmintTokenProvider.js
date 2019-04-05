/* This is for monetarySupervisor too. Which requires LockManager (monetarySupervisor address to be used is comig from there) */
import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";
import { fetchLatestTransfers, processNewTransfer } from "modules/reducers/userTransfers";
import { fetchUserBalance } from "modules/reducers/userBalances";

let isWatchSetup = false;

export default () => {
    const augmintToken = store.getState().contracts.latest.augmintToken;
    const augmintTokenData = store.getState().augmintToken;

    if (augmintToken && !augmintTokenData.isLoaded && !augmintTokenData.isLoading) {
        console.debug(
            "augmintTokenProvider - augmintToken not connected and not loading, dispatching refreshAugmintToken() refreshMonetarySupervisor() "
        );

        refresh();
        setupListeners();
    }

    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("contracts.latest.augmintToken", onAugmintTokenContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }
    return;
};

const setupListeners = () => {
    const augmintToken = store.getState().contracts.latest.augmintToken.ethersInstance;

    augmintToken.on("AugmintTransfer", (...args) => {
        onAugmintTransfer(...args);
    });

    // TODO: monetarySupervisor events: ParamsChanged, AcceptedLegacyAugmintTokenChanged,
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    console.debug("augmintTokenProvider - web3Connect.network changed");
    if (store.getState().contracts.latest.augmintToken && newVal !== null) {
        console.debug("augmintTokenProvider - web3Connect.network changed. Dispatching refreshAugmintToken() ");
        store.dispatch(refreshAugmintToken());
    }
};

const refresh = () => {
    const userAccount = store.getState().web3Connect.userAccount;

    store.dispatch(refreshAugmintToken());
    store.dispatch(refreshMonetarySupervisor());
    store.dispatch(fetchUserBalance(userAccount));
    store.dispatch(fetchLatestTransfers(userAccount));
};

const onAugmintTokenContractChange = (newVal, oldVal, objectPath) => {
    if (newVal) {
        console.debug(
            "augmintTokenProvider - augmintToken.contract changed. Dispatching refreshAugmintToken(), fetchUserBalance(), fetchTransferList() and refreshMonetarySupervisor()"
        );

        refresh();
        setupListeners();
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const augmintToken = store.getState().contracts.latest.augmintToken;
    if (augmintToken && newVal !== "?") {
        console.debug(
            "augmintTokenProvider - web3Connect.userAccount changed. Dispatching fetchUserBalance() and fetchTransferList()"
        );
        store.dispatch(fetchUserBalance(newVal));
        // TODO: default fromBlock should be the blockNumber of the contract deploy (retrieve it in SolidityContract)
        store.dispatch(fetchLatestTransfers(newVal));
    }
};

const onAugmintTransfer = function(from, to, amount, narrative, fee, eventObject) {
    // event AugmintTransfer(address indexed from, address indexed to, uint amount, string narrative, uint fee);
    console.debug("augmintTokenProvider.onAugmintTransfer: Dispatching refreshAugmintToken()");
    store.dispatch(refreshAugmintToken());
    const userAccount = store.getState().web3Connect.userAccount;
    if (from.toLowerCase() === userAccount.toLowerCase() || to.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "augmintTokenProvider.onAugmintTransfer: Transfer to or from for current userAccount. Dispatching processTransfer & fetchUserBalance"
        );
        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(processNewTransfer(userAccount, eventObject));
    }
};
