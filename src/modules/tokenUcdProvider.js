import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { connectTokenUcd, refreshTokenUcd } from "modules/reducers/tokenUcd";
import {
    fetchTransferList,
    processTransfer
} from "modules/reducers/userTransfers";
import { fetchUserBalance } from "modules/reducers/userBalances";

export default () => {
    const tokenUcd = store.getState().tokenUcd;
    let web3Connect = store.getState().web3Connect;

    if (!tokenUcd.isLoading && !tokenUcd.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("tokenUcd.contract", onTokenUcdContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
        if (web3Connect.isConnected) {
            console.debug(
                "tokenUcdProvider - tokenUcd not connected and not loading and web3 alreay loaded, dispatching connectTokenUcd() "
            );
            store.dispatch(connectTokenUcd());
        }
    }
    return;
};

const setupListeners = () => {
    const tokenUcd = store.getState().tokenUcd.contract.instance;
    tokenUcd
        .e_transfer({ fromBlock: "latest", toBlock: "pending" })
        .watch(onTransfer);
};

const removeListeners = oldInstance => {
    if (oldInstance && oldInstance.instance) {
        oldInstance.instance.e_transfer().stopWatching();
    }
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal !== null) {
        console.debug(
            "tokenUcdProvider - web3Connect.network changed. Dispatching connectTokenUcd()"
        );
        store.dispatch(connectTokenUcd());
    }
};

const onTokenUcdContractChange = (newVal, oldVal, objectPath) => {
    removeListeners(oldVal);
    if (newVal) {
        console.debug(
            "tokenUcdProvider - tokenUcd.contract changed. Dispatching refreshTokenUcd(), fetchUserBalance() and fetchTransferList()"
        );
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(refreshTokenUcd());
        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(fetchTransferList(userAccount, 0, "latest"));
        setupListeners();
    }
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const tokenUcd = store.getState().tokenUcd;
    if (tokenUcd.isConnected && newVal !== "?") {
        console.debug(
            "tokenUcdProvider - web3Connect.userAccount changed. Dispatching fetchUserBalance() and fetchTransferList()"
        );
        store.dispatch(fetchUserBalance(newVal));
        store.dispatch(fetchTransferList(newVal, 0, "latest"));
    }
};

const onTransfer = (error, result) => {
    console.debug("tokenUcdProvider.onTransfer: Dispatching refreshTokenUcd");
    store.dispatch(refreshTokenUcd());
    const userAccount = store.getState().web3Connect.userAccount;
    if (
        result.args.from.toLowerCase() === userAccount.toLowerCase() ||
        result.args.to.toLowerCase() === userAccount.toLowerCase()
    ) {
        console.debug(
            "tokenUcdProvider.onTransfer: e_transfer to or from for current userAccount. Dispatching processTransfer & fetchUserBalance"
        );
        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(processTransfer(userAccount, result));
    }
};
