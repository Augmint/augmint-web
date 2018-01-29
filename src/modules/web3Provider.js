import store from "modules/store";
import watch from "redux-watch";
import { setupWeb3, accountChange } from "modules/reducers/web3Connect";

/*
    TODO: make it to a HOC
*/
let newBlockHeadersFilter, pendingTransactionsFilter;
let intervalId;
let watches = {};

export const connectWeb3 = () => {
    let web3Connect = store.getState().web3Connect;

    if (!web3Connect.isConnected && !web3Connect.isLoading) {
        console.debug(
            "web3Provider - web3 is not connected and not loading. Setting up watches and dispatching setUpWeb3() for onLoad"
        );
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        if (document.readyState === "complete") {
            onLoad();
        } else {
            window.addEventListener("load", onLoad);
        }
    }
    return;
};

const onLoad = () => {
    store.dispatch(setupWeb3());
    if (!intervalId) {
        intervalId = setInterval(async function() {
            const web3 = store.getState().web3Connect;
            if (web3 && web3.isConnected & !web3.isLoading) {
                const currentAccounts = await web3.web3Instance.eth.getAccounts();
                const userAccount = store.getState().web3Connect.userAccount;
                if (currentAccounts[0] !== userAccount) {
                    console.debug(
                        "App.setInterval - web3.eth.accounts[0] change detected. dispatching accountChange()"
                    );
                    store.dispatch(accountChange(currentAccounts));
                }
            }
        }, 1000);
    }
};

export const setupWatch = (stateToWatch, callback) => {
    if (!watches[stateToWatch]) {
        watches[stateToWatch] = {};
    } else if (watches[stateToWatch].unsubscribe) {
        //watches[stateToWatch].unsubscribe(); // TODO: do we need to unsubscribe? ie. when network change? if so then we need to track each callback added other wise subsequent setupWatches for the same state var are removing previous watches
    }
    const watchConf = watch(store.getState, stateToWatch);
    watches[stateToWatch].unsubscribe = store.subscribe(
        watchConf((newVal, oldVal, objectPath) => {
            callback(newVal, oldVal, objectPath);
        })
    );
    return watches[stateToWatch].unsubscribe;
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    // TODO: make filters + subscriptions generic, e.g use an array
    if (newBlockHeadersFilter) {
        newBlockHeadersFilter.unsubscribe();
    }
    if (pendingTransactionsFilter) {
        pendingTransactionsFilter.unsubscribe();
    }
    if (newVal) {
        console.debug("web3Provider - web3Connect.network changed. subscribing to newBlockHeaders event (not working)");
        // const web3 = store.getState().web3Connect.web3Instance;
        // FIXME: these are not working b/c: https://github.com/MetaMask/metamask-extension/issues/2393
        // newBlockHeadersFilter = web3.eth.subscribe("newBlockHeaders", onNewBlock);
        // pendingTransactionsFilter = web3.eth
        //     .subscribe("pendingTransactions", (error, tx) => {
        //         if (error) {
        //             console.error("pendingTransaction error:", error);
        //         } else {
        //             console.debug("pendingTransactions", tx);
        //         }
        //     })
        //     .on("data", tx => onPendingTransaction(tx));
    }
};

// const onNewBlock = (error, result) => {
//     console.debug("web3Provider.onNewBlock");
// };
//
// const onPendingTransaction = tx => {
//     console.debug("onPendingTransaction", tx);
// };
