import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshPreToken, fetchTransfersForAccount } from "modules/reducers/preToken";

let isWatchSetup = false;
let processedContractEvents; //** map of eventIds processed: Workaround for bug that web3 beta 36 fires events 2x with MetaMask */

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
    processedContractEvents = {};

    // TODO: use augmint-js class when augmint-js exposes it
    const preToken = store.getState().contracts.latest.preToken.web3ContractInstance;

    preToken.events.NewAgreement({}, (error, event) => {
        // Workaround for bug that web3 beta 36 fires events 2x with MetaMask TODO: check with newer web3 versions if fixed
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            onNewAgreement(error, event);
        }
    });

    preToken.events.Transfer({}, (error, event) => {
        // Workaround for bug that web3 beta 36 fires events 2x with MetaMask TODO: check with newer web3 versions if fixed
        if (!processedContractEvents[event.id]) {
            processedContractEvents[event.id] = true;
            onTransfer(error, event);
        }
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

const onNewAgreement = (error, event) => {
    // event NewAgreement(address owner, bytes32 agreementHash, uint32 discount, uint32 valuationCap);
    console.debug("preTokenProvider.onNewAgreement: dispatching refreshPretoken TODO:  fetchAgreements");
    store.dispatch(refreshPreToken());
};

const onTransfer = (error, event) => {
    // event Transfer(address indexed from, address indexed to, uint amount);
    console.debug("preTokenProvider.onTransfer: dispatching  fetchTransfersForAccount");
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
