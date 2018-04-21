/* TODO: this is now not only augmintToken but monetarySupervisor too. shall we rename or split? */
import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectAugmintToken, refreshAugmintToken } from "modules/reducers/augmintToken";
import { connectMonetarySupervisor } from "modules/reducers/monetarySupervisor";
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
                "augmintTokenProvider - augmintToken not connected and not loading and web3 alreay loaded, dispatching connectAugmintToken() "
            );
            store.dispatch(connectAugmintToken());
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
        console.debug(
            "augmintTokenProvider - web3Connect.network changed. Dispatching connectAugmintToken() & connectMonetarySupervisor()"
        );
        store.dispatch(connectAugmintToken());
    }
};

const onAugmintTokenContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug(
            "augmintTokenProvider - augmintToken.contract changed. Dispatching fetchUserBalance(), fetchTransferList() and connectMonetarySupervisor()"
        );
        store.dispatch(connectMonetarySupervisor());

        const userAccount = store.getState().web3Connect.userAccount;
        const augmintToken = store.getState().augmintToken;

        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(fetchTransfers(userAccount, augmintToken.contract.deployedAtBlock, "latest"));
        setupListeners();
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const augmintToken = store.getState().augmintToken;
    if (augmintToken.isConnected && newVal !== "?") {
        console.debug(
            "augmintTokenProvider - web3Connect.userAccount changed. Dispatching fetchUserBalance() and fetchTransferList()"
        );
        store.dispatch(fetchUserBalance(newVal));
        // TODO: default fromBlock should be the blockNumber of the contract deploy (retrieve it in SolidityContract)
        store.dispatch(fetchTransfers(newVal, augmintToken.contract.deployedAtBlock, "latest"));
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
