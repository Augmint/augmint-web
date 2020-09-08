/* TODO: maintain loan state instead of full refresh on loan repay, newloan, loancollected events */

import { ethers } from "ethers";
import store from "modules/store";
import { setupWatch } from "./initialFunctions.js";
import { fetchLockProducts } from "modules/reducers/lockManager";
import { refreshLoanManager, fetchLoanProducts, fetchLoansToCollect } from "modules/reducers/loanManager";
import { fetchLoansForAddress } from "modules/reducers/loans";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { fetchUserBalance } from "modules/reducers/userBalances";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";

let isWatchSetup = false;
let inited = false;

const init = () => {
    if (!inited) {
        inited = true;
        refresh();
        setupContractEventListeners();
    }
};

export default () => {
    const augmint = store.getState().web3Connect.augmint;

    if (augmint) {
        init();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("web3Connect.augmint", onAugmintChanged);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
        setupWatch("rates.info.lastUpdated", onRateChange);
    }
};

const onAugmintChanged = newVal => {
    if (newVal) {
        init();
    }
};

const makeEventObject = arr => arr.pop();

const setupContractEventListeners = () => {
    const connection = store.getState().web3Connect;
    const augmint = connection.augmint;
    const loanManagerContracts = augmint.deployedEnvironment.contracts.LoanManager;

    loanManagerContracts.forEach(loanManagerContract => {
        const loanManager = loanManagerContract.connectWithEthers(ethers, connection.ethers.provider);

        loanManager.on("NewLoan", (...args) => {
            onNewLoan(makeEventObject(Array.from(args)));
        });

        if (loanManager.interface.events.LoanRepayed) {
            loanManager.on("LoanRepayed", (...args) => {
                onLoanRepayed(makeEventObject(Array.from(args)));
            });
        }

        if (loanManager.interface.events.LoanRepaid) {
            loanManager.on("LoanRepaid", (...args) => {
                onLoanRepayed(makeEventObject(Array.from(args)));
            });
        }

        loanManager.on("LoanCollected", (...args) => {
            onLoanCollected(makeEventObject(Array.from(args)));
        });

        loanManager.on("LoanProductAdded", (...args) => {
            onLoanProductAdded(...args);
        });

        loanManager.on("LoanProductActiveStateChanged", (...args) => {
            onLoanProductActiveStateChanged(...args);
        });

        if (loanManager.interface.events.LoanChanged) {
            loanManager.on("LoanChanged", (...args) => {
                onLoanChanged(makeEventObject(Array.from(args)));
            });
        }
    });

    // TODO: add & handle loanproduct change events
};

const refresh = () => {
    const userAccount = store.getState().web3Connect.userAccount;
    store.dispatch(refreshLoanManager());
    store.dispatch(fetchLoanProducts());
    store.dispatch(fetchLoansForAddress(userAccount));
};

const onUserAccountChange = newVal => {
    const augmint = store.getState().web3Connect.augmint;
    if (augmint && newVal !== "?") {
        refresh();
    }
};

const onRateChange = newVal => {
    const userAccount = store.getState().web3Connect.userAccount;
    store.dispatch(fetchLoansForAddress(userAccount));
};

// contract events ----

//  event LoanProductAdded(uint32 productId);
const onLoanProductAdded = (productId, ethersEvent) => {
    console.debug("loanManagerProvider.onLoanProductAdded: dispatching refreshLoanManager and fetchLoanProducts");
    store.dispatch(fetchLoanProducts()); // to fetch new product
};

// event LoanProductActiveStateChanged(uint32 productId, bool newState);
const onLoanProductActiveStateChanged = (productId, newState, ethersEvent) => {
    console.debug("loanManagerProvider.onLoanProductActiveStateChanged: dispatching fetchLoanProducts");
    store.dispatch(fetchLoanProducts()); // to refresh product list
};

// event NewLoan(uint32 productId, uint loanId, address indexed borrower, uint collateralAmount, uint loanAmount,
//                  uint repaymentAmount, uint40 maturity);
const onNewLoan = ethersEvent => {
    console.debug(
        "loanManagerProvider.onNewLoan: dispatching refreshLoanManager, fetchLoanProducts, fetchLockProducts & refreshMonetarySupervisor"
    );

    const { borrower } = ethersEvent.args;

    // AugmintTokenPropvider does it on AugmintTransfer: store.dispatch(refreshAugmintToken()); // update totalSupply
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isLoaded) {
        store.dispatch(fetchLockProducts()); // to update maxLockAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onNewLoan: new loan for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// event LoanRepayed(uint loanId, address borrower);
const onLoanRepayed = ethersEvent => {
    console.debug(
        "loanManagerProvider.onRepayed:: Dispatching fetchLoanProducts, fetchLockProducts & refreshMonetarySupervisor"
    );

    const { borrower } = ethersEvent.args;

    // AugmintTokenPropvider does it on AugmintTransfer: store.dispatch(refreshAugmintToken()); // update totalSupply
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isLoaded) {
        store.dispatch(fetchLockProducts()); // to update maxLockAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onRepayed: loan repayed for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// event LoanCollected(uint loanId, address indexed borrower, uint collectedCollateral, uint releasedCollateral, uint defaultingFee);
const onLoanCollected = ethersEvent => {
    console.debug(
        "loanManagerProvider.onCollected: Dispatching fetchLoanProducts, fetchLockProducts, refreshAugmintToken & refreshMonetarySupervisor"
    );

    const { borrower } = ethersEvent.args;

    store.dispatch(refreshAugmintToken()); // update fee accounts (no AugmintTransfer on loan collection tx)
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isLoaded) {
        store.dispatch(fetchLockProducts()); // to update maxLockAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onCollected: loan collected for current user. Dispatching fetchLoans & fetchUserBalance"
        );

        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }

    store.dispatch(fetchLoansToCollect());
};

const onLoanChanged = ethersEvent => {
    // TODO: this is taken from the newLoan eventhandler!

    console.debug(
        "loanManagerProvider.onLoanChanged: dispatching refreshLoanManager, fetchLoanProducts, fetchLockProducts & refreshMonetarySupervisor"
    );

    const { borrower } = ethersEvent.args;

    // AugmintTokenPropvider does it on AugmintTransfer: store.dispatch(refreshAugmintToken()); // update totalSupply
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isLoaded) {
        store.dispatch(fetchLockProducts()); // to update maxLockAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.loanChanged: new loan for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};
