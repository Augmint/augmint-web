import store from "modules/store";
import { setupWatch } from "./initialFunctions.js";
import { refreshLockManager, fetchLockProducts } from "modules/reducers/lockManager";
import { fetchLoanProducts } from "modules/reducers/loanManager";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";
import { fetchLocksForAddress, processNewLock } from "modules/reducers/locks";
import { fetchUserBalance } from "modules/reducers/userBalances";
import { patchEthersEvent } from "modules/ethereum/ethersHelper";

let isWatchSetup = false;

export default () => {
    const lockManager = store.getState().contracts.latest.lockManager;
    const lockManagerData = store.getState().lockManager;

    if (lockManager && !lockManagerData.isLoading && !lockManagerData.isLoaded) {
        refresh();
        setupContractEventListeners();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.lockManager", onLockContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }
    return;
};

const setupContractEventListeners = () => {
    const lockManager = store.getState().contracts.latest.lockManager.ethersInstance;

    lockManager.on("NewLockProduct", (...args) => {
        onNewLockProduct(...args);
    });

    lockManager.on("LockProductActiveChange", (...args) => {
        onLockProductActiveChange(...args);
    });

    lockManager.on("NewLock", (...args) => {
        onNewLock(...args);
    });

    lockManager.on("LockReleased", (...args) => {
        onLockReleased(...args);
    });
};

const refresh = () => {
    const userAccount = store.getState().web3Connect.userAccount;
    store.dispatch(refreshLockManager());
    store.dispatch(fetchLockProducts());
    store.dispatch(fetchLocksForAddress(userAccount));
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const lockManager = store.getState().contracts.latest.loanManager;
    if (lockManager && newVal !== "?") {
        console.debug("lockManagerProvider - web3Connect.userAccount changed. Dispatching fetchLocksForAddress()");
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(fetchLocksForAddress(userAccount));
    }
};

const onLockContractChange = (newVal, oldVal) => {
    console.debug(
        "lockManagerProvider - new lockManager contract. Dispatching refreshLockManager, fetchProducts, fetchLocksForAddress"
    );
    refresh();
    setupContractEventListeners();
};

// event NewLockProduct(uint32 indexed lockProductId, uint32 perTermInterest, uint32 durationInSecs, uint32 minimumLockAmount, bool isActive);
const onNewLockProduct = (lockProductId, perTermInterest, durationInSecs, minimumLockAmount, isActive, ethersEvent) => {
    console.debug("lockManagerProvider.onNewLockProduct: dispatching refreshLockManager and fetchLockProducts");

    store.dispatch(refreshLockManager()); // to update product count
    store.dispatch(fetchLockProducts()); // to fetch new product
};

// event LockProductActiveChange(uint32 indexed lockProductId, bool newActiveState);
const onLockProductActiveChange = (lockProductId, newActiveState, ethersEvent) => {
    console.debug("lockManagerProvider.onLockProductActiveChange: dispatching fetchLockProducts");
    store.dispatch(fetchLockProducts()); // to refresh product list
};

// event NewLock(address indexed lockOwner, uint lockId, uint amountLocked, uint interestEarned,
//                 uint40 lockedUntil, uint32 perTermInterest, uint32 durationInSecs);
const onNewLock = (
    lockOwner,
    lockId,
    amountLocked,
    interestEarned,
    lockedUntil,
    perTermInterest,
    durationInSecs,
    ethersEvent
) => {
    console.debug(
        "lockManagerProvider.onNewLock: dispatching refreshLockManager, fetchLockProducts, fetchLoanProducts & refreshMonetarySupervisor"
    );

    const event = patchEthersEvent(ethersEvent);

    store.dispatch(refreshMonetarySupervisor()); // to update totalLockAmount
    store.dispatch(refreshLockManager()); // to update lockCount
    store.dispatch(fetchLockProducts()); // to update maxLockAmounts

    if (store.getState().loanManager.isLoaded) {
        store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (event.returnValues.lockOwner.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "lockManagerProvider.onNewLock: new lock for current user. Dispatching processNewLock & fetchUserBalance"
        );
        store.dispatch(processNewLock(userAccount, event));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// event LockReleased(address indexed lockOwner, uint lockId);
const onLockReleased = (lockOwner, lockId, ethersEvent) => {
    console.debug(
        "lockManagerProvider.onLockReleased: dispatching refreshLockManager, fetchLockProducts, fetchLoanProducts & refreshMonetarySupervisor"
    );

    const event = patchEthersEvent(ethersEvent);

    store.dispatch(refreshMonetarySupervisor()); // to update totalLockAmount
    store.dispatch(refreshLockManager()); // to update lockCount
    store.dispatch(fetchLockProducts()); // to update maxLockAmounts

    if (store.getState().loanManager.isLoaded) {
        store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (event.returnValues.lockOwner.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "lockManagerProvider.onLockReleased: lock released for current user. Dispatching fetchLocksForAddress & fetchUserBalance"
        );
        // TODO: just update the lock instead of full refetch of all locks
        store.dispatch(fetchLocksForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};
