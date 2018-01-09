import store from "modules/store";
import watch from "redux-watch";
import { setupWeb3, accountChange } from "modules/reducers/web3Connect";

/*
    TODO: make it to a HOC
*/
let filterAllBlocks, intervalId;
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
                let currentAccounts = await web3.web3Instance.eth.getAccounts();
                let userAccount = store.getState().web3Connect.userAccount;
                if (currentAccounts[0] !== userAccount) {
                    console.debug(
                        "App.setInterval - web3.eth.accounts[0] change detected. dispatching accountChange()"
                    );
                    store.dispatch(accountChange(currentAccounts));
                }
            }
        }, 500);
    }
};

export const setupWatch = (stateToWatch, callback) => {
    if (!watches[stateToWatch]) {
        watches[stateToWatch] = {};
    } else if (watches[stateToWatch].unsubscribe) {
        //watches[stateToWatch].unsubscribe(); // TODO: do we need to unsubscribe? ie. when network change? if so then we need to track each callback added other wise subsequent setupWatches for the same state var are removing previous watches
    }
    let watchConf = watch(store.getState, stateToWatch);
    watches[stateToWatch].unsubscribe = store.subscribe(
        watchConf((newVal, oldVal, objectPath) => {
            callback(newVal, oldVal, objectPath);
        })
    );
    return watches[stateToWatch].unsubscribe;
};

const onWeb3NetworkChange = (newVal, oldVal, objectPath) => {
    if (filterAllBlocks) {
        filterAllBlocks.unsubscribe();
    }
    if (newVal) {
        console.debug("web3Provider - web3Connect.network changed. subscribing to newBlockHeaders event ");
        const web3 = store.getState().web3Connect.web3Instance;
        filterAllBlocks = web3.eth.subscribe("newBlockHeaders", onNewBlock);
    }
};

const onNewBlock = (error, result) => {
    // TODO: this is not working
    console.debug("web3Provider.onNewBlock");
};
