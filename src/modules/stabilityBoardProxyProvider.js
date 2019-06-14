import store from "modules/store";
import { setupWatch } from "./initialFunctions.js";
import { refreshStabilityBoardProxy, fetchScripts, fetchSigners } from "modules/reducers/stabilityBoardProxy";

let isWatchSetup = false;

export default () => {
    const stabilityBoardProxy = store.getState().contracts.latest.stabilityBoardProxy;
    const stabilityBoardProxyData = store.getState().stabilityBoardProxy;

    if (stabilityBoardProxy && !stabilityBoardProxyData.isLoading && !stabilityBoardProxyData.isLoaded) {
        console.debug(
            "stabilityBoardProxyProvider - stabilityBoardProxy not connected or loading and web3 already loaded, dispatching refreshStabilityBoardProxy() "
        );
        refresh();
        setupContractEventListeners();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.stabilityBoardProxy", onStabilityBoardProxyContractChange);
    }
    return;
};

const setupContractEventListeners = () => {
    const stabilityBoardProxy = store.getState().contracts.latest.stabilityBoardProxy.ethersInstance;
    stabilityBoardProxy.on("SignerAdded", (...args) => {
        onSignerAdded(...args);
    });
    stabilityBoardProxy.on("SignerRemoved", (...args) => {
        onSignerRemoved(...args);
    });
    stabilityBoardProxy.on("ScriptSigned", (...args) => {
        onScriptSigned(...args);
    });
    stabilityBoardProxy.on("ScriptApproved", (...args) => {
        onScriptApproved(...args);
    });
    stabilityBoardProxy.on("ScriptSigned", (...args) => {
        onScriptCancelled(...args);
    });
    stabilityBoardProxy.on("ScriptExecuted", (...args) => {
        onScriptExecuted(...args);
    });
};

const onStabilityBoardProxyContractChange = (newVal, oldVal, objectPath) => {
    console.debug(
        "stabilityBoardProxyProvider - stabilityBoardProxy Contract changed. Dispatching refreshStabilityBoardProxy, fetchSigners, fetchScripts"
    );
    refresh();
    setupContractEventListeners();
};

const refresh = () => {
    store.dispatch(refreshStabilityBoardProxy());
    store.dispatch(fetchScripts());
    store.dispatch(fetchSigners());
};

const onSignerAdded = (signer, eventObject) => {
    // event SignerAdded(address signer);
    console.debug("stabilityBoardProxyProvider.onSignerAdded: dispatching fetchSigners");
    store.dispatch(fetchSigners());
};

const onSignerRemoved = (signer, eventObject) => {
    // event SignerRemoved(address signer);
    console.debug("stabilityBoardProxyProvider.onSignerRemoved: dispatching fetchSigners");
    store.dispatch(fetchSigners());
};

const onScriptSigned = (scriptAddress, signer, eventObject) => {
    // event ScriptSigned(address scriptAddress, address signer);
    console.debug("stabilityBoardProxyProvider.onScriptSigned: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptApproved = (scriptAddress, eventObject) => {
    // event ScriptApproved(address scriptAddress);
    console.debug("stabilityBoardProxyProvider.onScriptApproved: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptCancelled = (scriptAddress, eventObject) => {
    // event onScriptCancelled(address scriptAddress);
    console.debug("stabilityBoardProxyProvider.onScriptCancelled: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptExecuted = (scriptAddress, result, eventObject) => {
    // event ScriptExecuted(address scriptAddress, bool result);
    console.debug("stabilityBoardProxyProvider.onScriptExecuted: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};
