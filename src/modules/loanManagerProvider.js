/* TODO: maintain loan state instead of full refresh on loan repay, newloan, loancollected events */

import { ethers } from "ethers";
import store from "modules/store";
import { setupWatch } from "./initialFunctions.js";
import { fetchLoanProducts, fetchLoansToCollect } from "modules/reducers/loanManager";
import { fetchLockProducts } from "modules/reducers/lockManager";
import { fetchLoansForAddress } from "modules/reducers/loans";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { fetchUserBalance } from "modules/reducers/userBalances";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";
import { patchEthersEvent } from "modules/ethereum/ethersHelper";

let isWatchSetup = false;
let inited = false;

const init = () => {
    if (!inited) {
        console.log("loanmanager provider init");
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
    }
};

const onAugmintChanged = newVal => {
    console.log("augmintChanged");
    if (newVal) {
        init();
    }
};

const setupContractEventListeners = () => {
    const connection = store.getState().web3Connect;
    const augmint = connection.augmint;
    const loanManagerContracts = augmint.deployedEnvironment.contracts.LoanManager;

    loanManagerContracts.forEach(loanManagerContract => {
        const loanManager = loanManagerContract.connectWithEthers(ethers, connection.ethers.provider);

        loanManager.on("NewLoan", (...args) => {
            onNewLoan(...args);
        });

        if (loanManager.interface.events.LoanRepayed) {
            loanManager.on("LoanRepayed", (...args) => {
                onLoanRepayed(...args);
            });
        }

        if (loanManager.interface.events.LoanRepaid) {
            loanManager.on("LoanRepaid", (...args) => {
                onLoanRepayed(...args);
            });
        }

        loanManager.on("LoanCollected", (...args) => {
            onLoanCollected(...args);
        });

        loanManager.on("LoanProductAdded", (...args) => {
            onLoanProductAdded(...args);
        });

        loanManager.on("LoanProductActiveStateChanged", (...args) => {
            onLoanProductActiveStateChanged(...args);
        });
    });

    // TODO: add & handle loanproduct change events
};

const refresh = () => {
    const userAccount = store.getState().web3Connect.userAccount;
    store.dispatch(fetchLoanProducts());
    store.dispatch(fetchLoansForAddress(userAccount));
};

const onUserAccountChange = newVal => {
    console.log("userAccountChanged");
    const augmint = store.getState().web3Connect.augmint;
    if (augmint && newVal !== "?") {
        refresh();
    }
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
const onNewLoan = (
    productId,
    loanId,
    borrower,
    collateralAmount,
    loanAmount,
    repaymentAmount,
    maturity,
    ethersEvent
) => {
    console.debug(
        "loanManagerProvider.onNewLoan: dispatching refreshLoanManager, fetchLoanProducts, fetchLockProducts & refreshMonetarySupervisor"
    );

    const event = patchEthersEvent(ethersEvent);

    // AugmintTokenPropvider does it on AugmintTransfer: store.dispatch(refreshAugmintToken()); // update totalSupply
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isLoaded) {
        store.dispatch(fetchLockProducts()); // to update maxLockAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (event.returnValues.borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onNewLoan: new loan for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// event LoanRepayed(uint loanId, address borrower);
const onLoanRepayed = (loanId, borrower, ethersEvent) => {
    console.debug(
        "loanManagerProvider.onRepayed:: Dispatching fetchLoanProducts, fetchLockProducts & refreshMonetarySupervisor"
    );

    const event = patchEthersEvent(ethersEvent);

    // AugmintTokenPropvider does it on AugmintTransfer: store.dispatch(refreshAugmintToken()); // update totalSupply
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isLoaded) {
        store.dispatch(fetchLockProducts()); // to update maxLockAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (event.returnValues.borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onRepayed: loan repayed for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

// event LoanCollected(uint loanId, address indexed borrower, uint collectedCollateral, uint releasedCollateral, uint defaultingFee);
const onLoanCollected = (loanId, borrower, collectedCollateral, releasedCollateral, defaultingFee, ethersEvent) => {
    console.debug(
        "loanManagerProvider.onCollected: Dispatching fetchLoanProducts, fetchLockProducts, refreshAugmintToken & refreshMonetarySupervisor"
    );

    const event = patchEthersEvent(ethersEvent);

    store.dispatch(refreshAugmintToken()); // update fee accounts (no AugmintTransfer on loan collection tx)
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isLoaded) {
        store.dispatch(fetchLockProducts()); // to update maxLockAmounts
    }

    const userAccount = store.getState().web3Connect.userAccount;
    if (event.returnValues.borrower.toLowerCase() === userAccount.toLowerCase()) {
        console.debug(
            "loanManagerProvider.onCollected: loan collected for current user. Dispatching fetchLoans & fetchUserBalance"
        );

        store.dispatch(fetchLoansForAddress(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }

    store.dispatch(fetchLoansToCollect());
};
