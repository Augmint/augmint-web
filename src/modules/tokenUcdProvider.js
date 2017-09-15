import store from "modules/store";
import watch from "redux-watch";
import { connectTokenUcd, refreshTokenUcd } from "modules/reducers/tokenUcd";
import {
    fetchTransferList,
    processTransfer
} from "modules/reducers/userTransfers";
import { fetchUserBalance } from "modules/reducers/userBalances";

/*
    TODO: make it to a HOC
*/
let w1Unsubscribe, w2Unsubscribe, filterAllBlocks;

export default () => {
    const tokenUcd = store.getState().tokenUcd;
    let web3Connect = store.getState().web3Connect;

    if (!tokenUcd.isLoading && !tokenUcd.isConnected) {
        setupWatches();
        if (web3Connect.isConnected) {
            console.debug(
                "tokenUcdProvider - tokenUcd not connected or loading and web3 alreay loaded, dispatching connectTokenUcd() "
            );
            store.dispatch(connectTokenUcd());
        }
    }
    return;
};

const setupListeners = () => {
    const tokenUcd = store.getState().tokenUcd.contract.instance;
    const web3 = store.getState().web3Connect.web3Instance;
    tokenUcd
        .e_transfer({ fromBlock: "latest", toBlock: "pending" })
        .watch(onTransfer);
    filterAllBlocks = web3.eth.filter("pending");
    filterAllBlocks.watch(onNewBlock);
};

const removeListeners = oldInstance => {
    if (oldInstance.instance) {
        oldInstance.instance.e_transfer().stopWatching();
    }
    filterAllBlocks.stopWatching();
};

const setupWatches = () => {
    let w1 = watch(store.getState, "web3Connect.web3ConnectionId");
    let unsubscribe = store.subscribe(
        w1((newVal, oldVal, objectPath) => {
            if (w1Unsubscribe) {
                w1Unsubscribe();
                removeListeners(oldVal);
            }
            w1Unsubscribe = unsubscribe;
            if (newVal !== null) {
                console.debug(
                    "tokenUcdProvider - web3Connect.web3ConnectionId changed. Dispatching connectTokenUcd()"
                );
                store.dispatch(connectTokenUcd());
            }
        })
    );

    let w2 = watch(store.getState, "tokenUcd.contract");
    unsubscribe = store.subscribe(
        w2((newVal, oldVal, objectPath) => {
            let userAccount = store.getState().web3Connect.userAccount;
            if (w2Unsubscribe) {
                w2Unsubscribe();
                removeListeners(oldVal);
            }
            w2Unsubscribe = unsubscribe;
            if (newVal) {
                console.debug(
                    "tokenUcdProvider - tokenUcd.contract changed. Dispatching refreshTokenUcd(), fetchUserBalance() and fetchTransferList()"
                );
                store.dispatch(refreshTokenUcd());
                store.dispatch(fetchUserBalance(userAccount));
                store.dispatch(fetchTransferList(userAccount, 0, "latest"));
                setupListeners();
            }
        })
    );
};

const onTransfer = (error, result) => {
    console.debug("tokenUcdProvider.onTransfer: Dispatching refreshTokenUcd");
    store.dispatch(refreshTokenUcd());
    let userAccount = store.getState().web3Connect.userAccount;
    if (
        result.args.from === userAccount.toLowerCase() ||
        result.args.to === userAccount.toLowerCase()
    ) {
        console.debug(
            "tokenUcdProvider.onTransfer: e_transfer to or from for current userAccount. Dispatching processTransfer & fetchUserBalance"
        );
        store.dispatch(fetchUserBalance(userAccount));
        store.dispatch(processTransfer(userAccount, result));
    }
};

const onNewBlock = (error, result) => {
    // TODO: think over UX how to display confirmed ("latest") and "pending" TXs
    //        Pending needed for quick UI refresh after tx submitted but we want to show when was it mined
    //let userAccount = store.getState().web3Connect.userAccount;
    console.debug("tokenUcdProvider.onNewBlock");
};
