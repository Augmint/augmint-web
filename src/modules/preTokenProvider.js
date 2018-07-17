import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshPreToken, fetchTransfersForAccount } from "modules/reducers/preToken";

let isWatchSetup = false;

export default () => {
    const preToken = store.getState().contracts.latest.preToken;
    const preTokenData = store.getState().preToken;

    if (preToken && !preTokenData.isLoading && !preTokenData.isLoaded) {
        console.debug(
            "preTokenProvider - preToken not connected or loading and web3 already loaded, dispatching refreshPreToken() "
        );
        refresh();
        setupListeners();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.preToken", onPreTokenContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }
    return;
};

const setupListeners = () => {
    const preToken = store.getState().contracts.latest.preToken.ethersInstance;
    preToken.onnewagreement = onNewAgreement;
    preToken.ontransfer = onTransfer;
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
    setupListeners();
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const preToken = store.getState().contracts.latest.preToken;
    if (preToken && newVal !== "?") {
        console.debug("preTokenProvider - web3Connect.userAccount changed. Dispatching fetchTransfersForAccount()");
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(fetchTransfersForAccount(userAccount));
    }
};

const onNewAgreement = (owner, agreementHash, discount, valuationCap) => {
    // event NewAgreement(address owner, bytes32 agreementHash, uint32 discount, uint32 valuationCap);
    console.debug("preTokenProvider.onNewAgreement: dispatching refreshPretoken TODO:  fetchAgreements");
    store.dispatch(refreshPreToken());
};

const onTransfer = (from, to, amount) => {
    // event Transfer(address indexed from, address indexed to, uint amount);
    console.debug("preTokenProvider.onTransfer: dispatching  fetchTransfersForAccount");
    store.dispatch(refreshPreToken());

    const userAccount = store.getState().web3Connect.userAccount;
    if (from.toLowerCase() === userAccount.toLowerCase() || to.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "preTokenProvider.onTransfer: transfer from/to current account . Dispatching fetchTransfersForAccount"
        );

        store.dispatch(fetchTransfersForAccount(userAccount));
    }
};
