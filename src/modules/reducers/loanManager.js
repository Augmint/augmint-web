/*
    TODO: use selectors. eg: https://github.com/reactjs/reselect
*/

import store from "modules/store";
import { fetchLoansToCollectTx } from "modules/ethereum/loanTransactions";

import { ONE_ETH_IN_WEI, DECIMALS_DIV } from "utils/constants";

export const LOANMANAGER_REFRESH_REQUESTED = "loanManager/LOANMANAGER_REFRESH_REQUESTED";
export const LOANMANAGER_REFRESHED = "loanManager/LOANMANAGER_REFRESHED";
export const LOANMANAGER_REFRESH_ERROR = "loanManager/LOANMANAGER_REFRESH_ERROR";

export const LOANMANAGER_PRODUCTLIST_REQUESTED = "loanManager/LOANMANAGER_PRODUCTLIST_REQUESTED";
export const LOANMANAGER_PRODUCTLIST_RECEIVED = "loanManager/LOANMANAGER_PRODUCTLIST_RECEIVED";
export const LOANMANAGER_PRODUCTLIST_ERROR = "loanManager/LOANMANAGER_PRODUCTLIST_ERROR";

export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED = "loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED";
export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED = "loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED";
export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR = "loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR";

const initialState = {
    isLoaded: false,
    isLoading: false,
    loadError: null,
    result: null,
    error: null,
    products: null,
    info: {
        bn_weiBalance: null,
        ethBalance: "?",
        bn_tokenBalance: null,
        tokenBalance: "?",
        loanCount: null,
        productCount: null,

        ratesAddress: "?",
        augmintTokenAddress: "?",
        monetarySupervisorAddress: "?"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANMANAGER_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case LOANMANAGER_REFRESHED:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                info: action.info
            };

        case LOANMANAGER_PRODUCTLIST_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case LOANMANAGER_PRODUCTLIST_RECEIVED:
            return {
                ...state,
                isLoading: false,
                products: action.products
            };

        case LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED:
            return {
                ...state,
                error: null,
                isLoading: true
            };

        case LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED:
            return {
                ...state,
                loansToCollect: action.result,
                isLoading: false
            };

        case LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR:
        case LOANMANAGER_REFRESH_ERROR:
        case LOANMANAGER_PRODUCTLIST_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export const refreshLoanManager = () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_REFRESH_REQUESTED
        });
        try {
            const loanManagerInstance = store.getState().contracts.latest.loanManager.web3ContractInstance;
            const info = await getLoanManagerInfo(loanManagerInstance);
            return dispatch({
                type: LOANMANAGER_REFRESHED,
                info
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOANMANAGER_REFRESH_ERROR,
                error: error
            });
        }
    };
};

async function getLoanManagerInfo(loanManagerInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const augmintTokenInstance = store.getState().contracts.latest.augmintToken.web3ContractInstance;

    const [
        loanCount,
        productCount,
        augmintTokenAddress,
        ratesAddress,
        monetarySupervisorAddress,
        bn_weiBalance,
        bn_tokenBalance
    ] = await Promise.all([
        loanManagerInstance.methods.getLoanCount().call(),
        loanManagerInstance.methods.getProductCount().call(),

        loanManagerInstance.methods.augmintToken().call(),
        loanManagerInstance.methods.rates().call(),
        loanManagerInstance.methods.monetarySupervisor().call(),

        web3.eth.getBalance(loanManagerInstance._address),
        augmintTokenInstance.methods.balanceOf(loanManagerInstance._address).call()
    ]);

    return {
        bn_weiBalance,
        ethBalance: bn_weiBalance / ONE_ETH_IN_WEI,
        bn_tokenBalance,
        tokenBalance: bn_tokenBalance / DECIMALS_DIV,
        loanCount: parseInt(loanCount, 10),
        productCount: parseInt(productCount, 10),
        augmintTokenAddress,
        ratesAddress,
        monetarySupervisorAddress
    };
}

export function fetchLoanProducts() {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_PRODUCTLIST_REQUESTED
        });

        try {
            const loanManager = store.getState().web3Connect.augmint.loanManager;
            const result = await loanManager.getProducts();
            return dispatch({
                type: LOANMANAGER_PRODUCTLIST_RECEIVED,
                products: result
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOANMANAGER_PRODUCTLIST_ERROR,
                error: error
            });
        }
    };
}

export function fetchLoansToCollect() {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED
        });

        try {
            const result = await fetchLoansToCollectTx();
            return dispatch({
                type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED,
                result: result
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR,
                error: error
            });
        }
    };
}
