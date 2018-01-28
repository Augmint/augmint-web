import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectAugmintToken, refreshAugmintToken } from "modules/reducers/augmintToken";
import { fetchTransferList } from "modules/reducers/userTransfers";
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
        console.debug("augmintTokenProvider - web3Connect.network changed. Dispatching connectAugmintToken()");
        store.dispatch(connectAugmintToken());
    }
};

const onAugmintTokenContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        if (oldVal) {
            console.debug("augmintTokenProvider - augmintToken.contract changed. Dispatching refreshAugmintToken()");
            store.dispatch(refreshAugmintToken());
        }
        console.debug(
            "augmintTokenProvider - augmintToken.contract changed. Dispatching fetchUserBalance() and fetchTransferList()"
        );
        const userAccount = store.getState().web3Connect.userAccount;

        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(fetchTransferList(userAccount, 0, "latest"));
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
        store.dispatch(fetchTransferList(newVal, 0, "latest"));
    }
};

const onAugmintTransfer = (from, to, amount, narrative, fee) => {
    // event AugmintTransfer(address indexed from, address indexed to, uint amount, string narrative, uint fee);
    console.debug("augmintTokenProvider.onAugmintTransfer: Dispatching refreshAugmintToken");
    store.dispatch(refreshAugmintToken());
    const userAccount = store.getState().web3Connect.userAccount;
    if (from.toLowerCase() === userAccount.toLowerCase() || to.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "augmintTokenProvider.onAugmintTransfer: Transfer to or from for current userAccount. Dispatching processTransfer & fetchUserBalance"
        );
        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(fetchTransferList(userAccount, 0, "latest")); // TODO: refresh only from last processed block
    }
};
