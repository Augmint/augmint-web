import { connectWeb3, onWeb3NetworkChange } from "./web3Provider";
import { getCookie } from "utils/cookie.js";
import { disclaimerChanged } from "modules/reducers/web3Connect";
import { documentLoaded } from "modules/reducers/documentProps";
import watch from "redux-watch";

let watches = {};
let store = null;

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

export const initialFunction = _store => {
    store = _store;

    setupWatch("web3Connect.disclaimerAccepted", connectWeb3);
    setupWatch("documentProps.documentLoaded", connectWeb3);
    setupWatch("web3Connect.network", onWeb3NetworkChange);

    checkDisclaimer();
    isDocumentLoaded();
};

function checkDisclaimer() {
    const disclaimerInitState = getCookie("disclaimerDismissed");
    if (disclaimerInitState) {
        store.dispatch(disclaimerChanged(disclaimerInitState));
    }
}

function isDocumentLoaded() {
    if (document.readyState === "complete") {
        store.dispatch(documentLoaded());
    } else {
        window.addEventListener("load", () => {
            store.dispatch(documentLoaded());
        });
    }
}
