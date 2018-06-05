import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshStabilityBoardSigner, fetchScripts, fetchSigners } from "modules/reducers/stabilityBoardSigner";

let isWatchSetup = false;

export default () => {
    const stabilityBoardSigner = store.getState().contracts.latest.stabilityBoardSigner;
    const stabilityBoardSignerData = store.getState().stabilityBoardSigner;

    if (stabilityBoardSigner && !stabilityBoardSignerData.isLoading && !stabilityBoardSignerData.isLoaded) {
        console.debug(
            "stabilityBoardSignerProvider - stabilityBoardSigner not connected or loading and web3 already loaded, dispatching refreshStabilityBoardSigner() "
        );
        refresh();
        setupListeners();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.stabilityBoardSigner", onStabilityBoardSignerContractChange);
    }
    return;
};

const setupListeners = () => {
    const stabilityBoardSigner = store.getState().contracts.latest.stabilityBoardSigner.ethersInstance;
    stabilityBoardSigner.onsigneradded = onSignerAdded;
    stabilityBoardSigner.onsignerremoved = onSignerRemoved;
    stabilityBoardSigner.onscriptsigned = onScriptSigned;
    stabilityBoardSigner.onscriptapproved = onScriptApproved;
    stabilityBoardSigner.onscriptsigned = onScriptCancelled;
    stabilityBoardSigner.onscriptexecuted = onScriptExecuted;
};

const onStabilityBoardSignerContractChange = (newVal, oldVal, objectPath) => {
    console.debug(
        "stabilityBoardSignerProvider - stabilityBoardSigner Contract changed. Dispatching refreshStabilityBoardSigner, fetchSigners, fetchScripts"
    );
    refresh();
    setupListeners();
};

const refresh = () => {
    store.dispatch(refreshStabilityBoardSigner());
    store.dispatch(fetchScripts());
    store.dispatch(fetchSigners());
};

const onSignerAdded = signer => {
    // event SignerAdded(address signer);
    console.debug("stabilityBoardSignerProvider.onSignerAdded: dispatching fetchSigners");
    store.dispatch(fetchSigners());
};

const onSignerRemoved = signer => {
    // event SignerRemoved(address signer);
    console.debug("stabilityBoardSignerProvider.onSignerRemoved: dispatching fetchSigners");
    store.dispatch(fetchSigners());
};

const onScriptSigned = (scriptAddress, signer) => {
    // event ScriptSigned(address scriptAddress, address signer);
    console.debug("stabilityBoardSignerProvider.onScriptSigned: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptApproved = scriptAddress => {
    // event ScriptApproved(address scriptAddress);
    console.debug("stabilityBoardSignerProvider.onScriptApproved: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptCancelled = scriptAddress => {
    // event onScriptCancelled(address scriptAddress);
    console.debug("stabilityBoardSignerProvider.onScriptCancelled: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};

const onScriptExecuted = (scriptAddress, result) => {
    // event ScriptExecuted(address scriptAddress, bool result);
    console.debug("stabilityBoardSignerProvider.onScriptExecuted: Dispatching fetchScripts");
    store.dispatch(fetchScripts());
};
