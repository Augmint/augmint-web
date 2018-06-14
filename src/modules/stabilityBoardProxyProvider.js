import store from "modules/store";
import { setupWatch } from "./web3Provider";
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
        setupListeners();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.stabilityBoardProxy", onStabilityBoardProxyContractChange);
    }
    return;
};

const setupListeners = () => {
    const stabilityBoardProxy = store.getState().contracts.latest.stabilityBoardProxy.ethersInstance;
    stabilityBoardProxy.onsigneradded = onSignerAdded;
    stabilityBoardProxy.onsignerremoved = onSignerRemoved;
    stabilityBoardProxy.onscriptsigned = onScriptSigned;
    stabilityBoardProxy.onscriptapproved = onScriptApproved;
    stabilityBoardProxy.onscriptsigned = onScriptCancelled;
    stabilityBoardProxy.onscriptexecuted = onScriptExecuted;
};

const onStabilityBoardProxyContractChange = (newVal, oldVal, objectPath) => {
    console.debug(
        "stabilityBoardProxyProvider - stabilityBoardProxy Contract changed. Dispatching refreshStabilityBoardProxy, fetchSigners, fetchScripts"
    );
    refresh();
    setupListeners();
};

const refresh = () => {
    store.dispatch(refreshStabilityBoardProxy());
    store.dispatch(fetchScripts());
    store.dispatch(fetchSigners());
};

const onSignerAdded = signer => {
    // event SignerAdded(address signer);
    console.debug("stabilityBoardProxyProvider.onSignerAdded: dispatching fetchSigners");
    store.dispatch(fetchSigners());
};

const onSignerRemoved = signer => {
    // event SignerRemoved(address signer);
    console.debug("stabilityBoardProxyProvider.onSignerRemoved: dispatching fetchSigners");
    store.dispatch(fetchSigners());
};

const onScriptSigned = (scriptAddress, signer) => {
    // event ScriptSigned(address scriptAddress, address signer);
    console.debug("stabilityBoardProxyProvider.onScriptSigned: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptApproved = scriptAddress => {
    // event ScriptApproved(address scriptAddress);
    console.debug("stabilityBoardProxyProvider.onScriptApproved: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptCancelled = scriptAddress => {
    // event onScriptCancelled(address scriptAddress);
    console.debug("stabilityBoardProxyProvider.onScriptCancelled: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptExecuted = (scriptAddress, result) => {
    // event ScriptExecuted(address scriptAddress, bool result);
    console.debug("stabilityBoardProxyProvider.onScriptExecuted: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};
