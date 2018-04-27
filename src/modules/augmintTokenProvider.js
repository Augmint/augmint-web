/* This is for monetarySupervisor too. Which requires LockManager (monetarySupervisor address to be used is comig from there) */
import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectAugmintToken, refreshAugmintToken } from "modules/reducers/augmintToken";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";
import { fetchTransfers, processNewTransfer } from "modules/reducers/userTransfers";
import { fetchUserBalance } from "modules/reducers/userBalances";

export default () => {
    const augmintToken = store.getState().augmintToken;
    const web3Connect = store.getState().web3Connect;

    if (!augmintToken.isLoading && !augmintToken.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("augmintToken.contract", onAugmintTokenContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
        if (web3Connect.isConnected) {
            console.debug(
                "augmintTokenProvider - augmintToken not connected and not loading and web3 alreay loaded, dispatching connectAugmintToken() refreshMonetarySupervisor() "
            );
            store.dispatch(connectAugmintToken());
            store.dispatch(refreshMonetarySupervisor());
        }
    }
    return;
};

const setupListeners = () => {
    const augmintToken = store.getState().augmintToken.contract.ethersInstance;
    augmintToken.onaugminttransfer = onAugmintTransfer;
    // TODO: monetarySupervisor events: ParamsChanged, AcceptedLegacyAugmintTokenChanged,
};

const removeListeners = oldInstance => {
    // TODO: test if we need this with ethers
    // if (oldInstance && oldInstance.instance) {
    //     oldInstance.instance.Transfer().stopWatching();
    // }
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal !== null) {
        console.debug("augmintTokenProvider - web3Connect.network changed. Dispatching connectAugmintToken() ");
        store.dispatch(connectAugmintToken());
    }
};

const onAugmintTokenContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug(
            "augmintTokenProvider - augmintToken.contract changed. Dispatching fetchUserBalance(), fetchTransferList() and refreshMonetarySupervisor()"
        );

        const userAccount = store.getState().web3Connect.userAccount;
        const augmintToken = store.getState().contracts.latest.augmintToken;

        store.dispatch(refreshMonetarySupervisor());
        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(fetchTransfers(userAccount, augmintToken.deployedAtBlock, "latest"));
        setupListeners();
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const augmintToken = store.getState().contracts.latest.augmintToken;
    if (augmintToken && newVal !== "?") {
        console.debug(
            "augmintTokenProvider - web3Connect.userAccount changed. Dispatching fetchUserBalance() and fetchTransferList()",
            newVal,
            augmintToken
        );
        store.dispatch(fetchUserBalance(newVal));
        // TODO: default fromBlock should be the blockNumber of the contract deploy (retrieve it in SolidityContract)
        store.dispatch(fetchTransfers(newVal, augmintToken.deployedAtBlock, "latest"));
    }
};

const onAugmintTransfer = function(from, to, amount, narrative, fee) {
    // event AugmintTransfer(address indexed from, address indexed to, uint amount, string narrative, uint fee);
    console.debug("augmintTokenProvider.onAugmintTransfer: Dispatching refreshAugmintToken");
    store.dispatch(refreshAugmintToken());
    const userAccount = store.getState().web3Connect.userAccount;
    if (from.toLowerCase() === userAccount.toLowerCase() || to.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "augmintTokenProvider.onAugmintTransfer: Transfer to or from for current userAccount. Dispatching processTransfer & fetchUserBalance"
        );
        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(processNewTransfer(userAccount, this));
    }
};
