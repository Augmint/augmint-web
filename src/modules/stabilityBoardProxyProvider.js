import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshStabilityBoardProxy, fetchScripts, fetchSigners } from "modules/reducers/stabilityBoardProxy";

let isWatchSetup = false;
let processedContractEvents; //** map of eventIds processed: Workaround for bug that web3 beta 36 fires events 2x with MetaMask */

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
    processedContractEvents = {};

    // TODO: use augmint-js class when augmint-js exposes it
    const stabilityBoardProxy = store.getState().contracts.latest.stabilityBoardProxy.web3ContractInstance;

    stabilityBoardProxy.events.SignerAdded({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            // event SignerAdded(address signer);
            console.debug("stabilityBoardProxyProvider.onSignerAdded: dispatching fetchSigners");
            store.dispatch(fetchSigners());
        }
    });

    stabilityBoardProxy.events.SignerRemoved({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            // event SignerRemoved(address signer);
            console.debug("stabilityBoardProxyProvider.onSignerRemoved: dispatching fetchSigners");
            store.dispatch(fetchSigners());
        }
    });

    stabilityBoardProxy.events.ScriptSigned({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            // event ScriptSigned(address scriptAddress, address signer);
            console.debug("stabilityBoardProxyProvider.onScriptSigned: Dispatching fetchScripts");
            store.dispatch(fetchScripts());
        }
    });

    stabilityBoardProxy.events.ScriptApproved({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            // event ScriptApproved(address scriptAddress);
            console.debug("stabilityBoardProxyProvider.onScriptApproved: Dispatching fetchScripts");
            store.dispatch(fetchScripts());
        }
    });

    stabilityBoardProxy.events.ScriptCancelled({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            // event onScriptCancelled(address scriptAddress);
            console.debug("stabilityBoardProxyProvider.onScriptCancelled: Dispatching fetchScripts");
            store.dispatch(fetchScripts());
        }
    });

    stabilityBoardProxy.events.ScriptExecuted({}, (error, event) => {
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            // event ScriptExecuted(address scriptAddress, bool result);
            console.debug("stabilityBoardProxyProvider.onScriptExecuted: Dispatching fetchScripts");
            store.dispatch(fetchScripts());
        }
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
