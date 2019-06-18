import store from "modules/store";
import { setupWatch } from "./initialFunctions.js";
import { refreshPreToken, fetchTransfersForAccount } from "modules/reducers/preToken";
import { patchEthersEvent } from "modules/ethereum/ethersHelper";

let isWatchSetup = false;

export default () => {
    const preToken = store.getState().contracts.latest.preToken;
    const preTokenData = store.getState().preToken;

    if (preToken && !preTokenData.isLoading && !preTokenData.isLoaded) {
        console.debug(
            "preTokenProvider - preToken not connected or loading and web3 already loaded, dispatching refreshPreToken() "
        );
        refresh();
        setupContractEventListeners();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.preToken", onPreTokenContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }
    return;
};

const setupContractEventListeners = () => {
    const preToken = store.getState().contracts.latest.preToken.ethersInstance;

    preToken.on("NewAgreement", (...args) => {
        onNewAgreement(...args);
    });

    preToken.on("Transfer", (...args) => {
        onTransfer(...args);
    });
};

const refresh = () => {
    const userAccount = store.getState().web3Connect.userAccount;
    store.dispatch(refreshPreToken());
    store.dispatch(fetchTransfersForAccount(userAccount));
};

const onPreTokenContractChange = (newVal, oldVal, objectPath) => {
    console.debug(
        "preTokenProvider - preToken Contract changed. Dispatching refreshPreToken, fetchTransfersForAccount"
    );
    refresh();
    setupContractEventListeners();
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const preToken = store.getState().contracts.latest.preToken;
    if (preToken && newVal !== "?") {
        console.debug("preTokenProvider - web3Connect.userAccount changed. Dispatching fetchTransfersForAccount()");
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(fetchTransfersForAccount(userAccount));
    }
};

// event NewAgreement(address owner, bytes32 agreementHash, uint32 discount, uint32 valuationCap);
const onNewAgreement = (owner, agreementHash, discount, valuationCap, ethersEvent) => {
    console.debug("preTokenProvider.onNewAgreement: dispatching refreshPretoken TODO:  fetchAgreements");
    store.dispatch(refreshPreToken());
};

// event Transfer(address indexed from, address indexed to, uint amount);
const onTransfer = (from, to, amount, ethersEvent) => {
    console.debug("preTokenProvider.onTransfer: dispatching  fetchTransfersForAccount");

    const event = patchEthersEvent(ethersEvent);

    store.dispatch(refreshPreToken());

    const userAccount = store.getState().web3Connect.userAccount;
    if (
        event.returnValues.from.toLowerCase() === userAccount.toLowerCase() ||
        event.returnValuesto.toLowerCase() === userAccount.toLowerCase()
    ) {
        console.debug(
            "preTokenProvider.onTransfer: transfer from/to current account . Dispatching fetchTransfersForAccount"
        );

        store.dispatch(fetchTransfersForAccount(userAccount));
    }
};
