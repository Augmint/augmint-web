import store from "modules/store";
import watch from "redux-watch";
import {
    connectLoanManager,
    refreshLoanManager,
    fetchProducts
} from "modules/reducers/loanManager";
import { fetchLoans } from "modules/reducers/loans";
import { refreshTokenUcd } from "modules/reducers/tokenUcd";
import { fetchUserBalance } from "modules/reducers/userBalances";
/*
    TODO: make it to a HOC
*/
let w1Unsubscribe, w2Unsubscribe;

export default () => {
    const loanManager = store.getState().loanManager;
    let web3Connect = store.getState().web3Connect;

    if (!loanManager.isLoading && !loanManager.isConnected) {
        setupWatches();
        if (web3Connect.isConnected) {
            console.debug(
                "loanManagerProvider - loanManager not connected or loading and web3 alreay loaded, dispatching connectLoanManager() "
            );
            store.dispatch(connectLoanManager());
        }
    }
    return;
};

const setupListeners = () => {
    const loanManager = store.getState().loanManager.contract.instance;
    loanManager
        .e_newLoan({ fromBlock: "latest", toBlock: "pending" })
        .watch(onNewLoan);
    loanManager
        .e_repayed({ fromBlock: "latest", toBlock: "pending" })
        .watch(onRepayed);
    loanManager
        .e_collected({ fromBlock: "latest", toBlock: "pending" })
        .watch(onCollected);
    // TODO: add & handle loanproduct change events
    // TODO: remove prev listeners
};

const removeListeners = oldInstance => {
    if (oldInstance.instance) {
        oldInstance.instance.e_newLoan().stopWatching();
        oldInstance.instance.e_repayed().stopWatching();
        oldInstance.instance.e_collected().stopWatching();
    }
};

const setupWatches = () => {
    let w1 = watch(store.getState, "web3Connect.web3ConnectionId");
    let unsubscribe = store.subscribe(
        w1((newVal, oldVal, objectPath) => {
            if (w1Unsubscribe) {
                w1Unsubscribe();
                removeListeners(oldVal);
            }
            w1Unsubscribe = unsubscribe;
            if (newVal !== null) {
                console.debug(
                    "loanManagerProvider - web3Connect.web3ConnectionId changed. Dispatching connectLoanManager()"
                );
                store.dispatch(connectLoanManager());
            }
        })
    );

    let w2 = watch(store.getState, "loanManager.contract");
    unsubscribe = store.subscribe(
        w2((newVal, oldVal, objectPath) => {
            let userAccount = store.getState().web3Connect.userAccount;
            if (w2Unsubscribe) {
                w2Unsubscribe();
                removeListeners(oldVal);
            }
            w2Unsubscribe = unsubscribe;
            if (newVal) {
                console.debug(
                    "loanManagerProvider - loanManager.contract changed. Dispatching refreshLoanManager, fetchProducts, fetchLoans"
                );
                store.dispatch(refreshLoanManager());
                store.dispatch(fetchProducts());
                store.dispatch(fetchLoans(userAccount));
                setupListeners();
            }
        })
    );
};

const onNewLoan = (error, result) => {
    // event e_newLoan(uint8 productId, uint loanId, address borrower, address loanContract, uint disbursedLoanInUcd );
    console.debug(
        "loanManagerProvider.onNewLoan: dispatching refreshLoanManager & refreshTokenUcd"
    );
    store.dispatch(refreshTokenUcd());
    store.dispatch(refreshLoanManager()); // to update loanCount
    let userAccount = store.getState().web3Connect.userAccount;
    if (result.args.borrower === userAccount) {
        console.debug(
            "loanManagerProvider.onNewLoan: new loan for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoans(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

const onRepayed = (error, result) => {
    // e_repayed(loanContractAddress, loanContract.owner());
    console.debug(
        "loanManagerProvider.onRepayed:: Dispatching refreshTokenUcd"
    );
    store.dispatch(refreshTokenUcd());
    let userAccount = store.getState().web3Connect.userAccount;
    if (result.args.borrower === userAccount) {
        console.debug(
            "loanManagerProvider.onRepayed: loan repayed for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoans(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};

const onCollected = (error, result) => {
    // event e_collected(address borrower, address loanContractAddress);
    console.debug(
        "loanManagerProvider.onCollected: Dispatching refreshTokenUcd"
    );
    store.dispatch(refreshTokenUcd());
    let userAccount = store.getState().web3Connect.userAccount;
    if (result.args.borrower === userAccount) {
        console.debug(
            "loanManagerProvider.onCollected: loan collected for current user. Dispatching fetchLoans & fetchUserBalance"
        );
        // TODO: it can be expensive, should create a separate single fetchLoan action
        store.dispatch(fetchLoans(userAccount));
        store.dispatch(fetchUserBalance(userAccount));
    }
};
