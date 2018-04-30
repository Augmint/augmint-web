/* TODO: maintain loan state instead of full refresh on loan repay, newloan, loancollected events */

import store from "modules/store";
import { setupWatch } from "./web3Provider";
import { refreshLoanManager, fetchLoanProducts, fetchLoansToCollect } from "modules/reducers/loanManager";
import { fetchLockProducts } from "modules/reducers/lockManager";
import { fetchLoansForAddress } from "modules/reducers/loans";
import { refreshAugmintToken } from "modules/reducers/augmintToken";
import { fetchUserBalance } from "modules/reducers/userBalances";
import { refreshMonetarySupervisor } from "modules/reducers/monetarySupervisor";

let isWatchSetup = false;

export default () => {
    const loanManager = store.getState().contracts.latest.loanManager;
    const loanManagerData = store.getState().loanManager;

    if (loanManager && !loanManagerData.isLoading && !loanManagerData.isLoaded) {
        console.debug(
            "loanManagerProvider - loanManager not connected or loading and web3 already loaded, dispatching refreshLoanManager() "
        );
        refresh();
        setupListeners();
    }
    if (!isWatchSetup) {
        isWatchSetup = true;
        setupWatch("contracts.latest.loanManager", onLoanManagerContractChange);
        setupWatch("web3Connect.userAccount", onUserAccountChange);
    }
    return;
};

const setupListeners = () => {
    const loanManager = store.getState().contracts.latest.loanManager.ethersInstance;
    loanManager.onnewloan = onNewLoan;
    loanManager.onloanrepayed = onLoanRepayed;
    loanManager.onloancollected = onLoanCollected;
    // TODO: add & handle loanproduct change events
};

const onLoanManagerContractChange = (newVal, oldVal, objectPath) => {
    console.debug(
        "loanManagerProvider - loanManager Contract changed. Dispatching refreshLoanManager, fetchLoanProducts, fetchLoans"
    );
    refresh();
    setupListeners();
};

const refresh = () => {
    const userAccount = store.getState().web3Connect.userAccount;
    store.dispatch(refreshLoanManager());
    store.dispatch(fetchLoanProducts());
    store.dispatch(fetchLoansForAddress(userAccount));
};

const onUserAccountChange = (newVal, oldVal, objectPath) => {
    const loanManager = store.getState().contracts.latest.loanManager;
    if (loanManager && newVal !== "?") {
        console.debug("loanManagerProvider - web3Connect.userAccount changed. Dispatching fetchLoansForAddress()");
        const userAccount = store.getState().web3Connect.userAccount;
        store.dispatch(fetchLoansForAddress(userAccount));
    }
};

const onNewLoan = (productId, loanId, borrower, collateralAmount, loanAmount, repaymentAmount) => {
    // event NewLoan(uint8 productId, uint loanId, address borrower, uint collateralAmount, uint loanAmount, uint repaymentAmount);
    console.debug(
        "loanManagerProvider.onNewLoan: dispatching refreshLoanManager, fetchLoanProducts, fetchLockProducts & refreshMonetarySupervisor"
    );
    // AugmintTokenPropvider does it on AugmintTransfer: store.dispatch(refreshAugmintToken()); // update totalSupply
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(refreshLoanManager()); // to update loanCount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isConnected) {
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

const onLoanRepayed = (loanId, borrower) => {
    // event LoanRepayed(uint loanId, address borrower);
    console.debug(
        "loanManagerProvider.onRepayed:: Dispatching fetchLoanProducts, fetchLockProducts & refreshMonetarySupervisor"
    );
    // AugmintTokenPropvider does it on AugmintTransfer: store.dispatch(refreshAugmintToken()); // update totalSupply
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isConnected) {
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

const onLoanCollected = (loanId, borrower) => {
    // event LoanCollected(uint loanId, address borrower);
    console.debug(
        "loanManagerProvider.onCollected: Dispatching fetchLoanProducts, fetchLockProducts, refreshAugmintToken & refreshMonetarySupervisor"
    );
    store.dispatch(refreshAugmintToken()); // update fee accounts (no AugmintTransfer on loan collection tx)
    store.dispatch(refreshMonetarySupervisor()); // update totalLoanAmount
    store.dispatch(fetchLoanProducts()); // to update maxLoanAmounts
    if (store.getState().lockManager.isConnected) {
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

    const loansToCollect = store.getState().loanManager.loansToCollect;
    if (loansToCollect && loansToCollect.length > 0) {
        console.debug(
            "loanManagerProvider.onCollected: loan collected and we already had loans to collect fetched . Dispatching fetchLoansToCollect"
        );

        store.dispatch(fetchLoansToCollect());
    }
};
