import store from "modules/store";
import { setupWatch } from "./web3Provider";
import {
    connectLockManager,
    fetchProducts
} from "modules/reducers/lockManager";
// import { fetchLoansForAddress } from "modules/reducers/loans";
// import { refreshAugmintToken } from "modules/reducers/augmintToken";
// import { fetchUserBalance } from "modules/reducers/userBalances";

export default () => {
    const lockManager = store.getState().lockManager;
    const web3Connect = store.getState().web3Connect;

    if (!lockManager.isLoading && !lockManager.isConnected) {
        setupWatch("web3Connect.network", onWeb3NetworkChange);
        setupWatch("augmintToken.contract", onContractChange);
        setupWatch("lockManager.contract", onContractChange);
        // setupWatch("web3Connect.userAccount", onUserAccounChange);
        if (web3Connect.isConnected) {
            console.debug(
                "lockManagerProvider - lockManager not connected or loading and web3 already loaded, dispatching connectLockManager() "
            );
            store.dispatch(connectLockManager());
        }
    }
    return;
};

const setupListeners = () => {
    const lockManager = store.getState().lockManager.contract.ethersInstance;
    // lockManager.onnewloan = onNewLoan;
    // lockManager.onloanrepayed = onLoanRepayed;
    // lockManager.onloancollected = onLoanCollected;
};

const refresLockManagerIfNeeded = (newVal, oldVal) => {
    if (newVal && store.getState().augmintToken.isConnected) {
        console.debug(
            "lockManagerProvider - new augmintToken or loanManager contract. Dispatching refreshLockManager, fetchProducts, fetchLocks"
        );
        // const userAccount = store.getState().web3Connect.userAccount;
        // store.dispatch(refreshLoanManager());
        store.dispatch(fetchProducts());
        // store.dispatch(fetchLoansForAddress(userAccount));
        setupListeners();
    }
};

const onWeb3NetworkChange = (newVal) => {
    if (newVal !== null) {
        console.debug("lockManagerProvider - web3Connect.network changed. Dispatching connectLockManager()");
        store.dispatch(connectLockManager());
        store.dispatch(fetchProducts());
    }
};

const onContractChange = (newVal, oldVal) => {
    refresLockManagerIfNeeded(newVal, oldVal);
};
