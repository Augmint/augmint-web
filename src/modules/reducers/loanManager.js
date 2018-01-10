/*
    TODO: handle race conditions on isLoading: eg. split connect, product list and newloan functions
    TODO: use selectors. eg: https://github.com/reactjs/reselect
*/

import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import loanManager_artifacts from "contractsBuild/LoanManager.json";
import { asyncGetBalance } from "modules/ethereum/ethHelper";
import {
    repayLoanTx,
    newEthBackedLoanTx,
    collectLoansTx,
    fetchLoansToCollectTx,
    fetchProductsTx
} from "modules/ethereum/loanTransactions";

export const LOANMANAGER_CONNECT_REQUESTED = "loanManager/LOANMANAGER_CONNECT_REQUESTED";
export const LOANMANAGER_CONNECT_SUCCESS = "loanManager/LOANMANAGER_CONNECT_SUCCESS";
export const LOANMANAGER_CONNECT_ERROR = "loanManager/LOANMANAGER_CONNECT_ERROR";

export const LOANMANAGER_REFRESH_REQUESTED = "loanManager/LOANMANAGER_REFRESH_REQUESTED";
export const LOANMANAGER_REFRESHED = "loanManager/LOANMANAGER_REFRESHED";
export const LOANMANAGER_REFRESH_ERROR = "loanManager/LOANMANAGER_REFRESH_ERROR";

export const LOANMANAGER_PRODUCTLIST_REQUESTED = "loanManager/LOANMANAGER_PRODUCTLIST_REQUESTED";
export const LOANMANAGER_PRODUCTLIST_RECEIVED = "loanManager/LOANMANAGER_PRODUCTLIST_RECEIVED";
export const LOANMANAGER_PRODUCTLIST_ERROR = "loanManager/LOANMANAGER_PRODUCTLIST_ERROR";

export const LOANMANAGER_NEWLOAN_REQUESTED = "loanManager/LOANMANAGER_NEWLOAN_REQUESTED";
export const LOANMANAGER_NEWLOAN_CREATED = "loanManager/LOANMANAGER_NEWLOAN_CREATED";
export const LOANMANAGER_NEWLOAN_ERROR = "loanManager/LOANMANAGER_NEWLOAN_ERROR";

export const LOANMANAGER_REPAY_REQUESTED = "loanManager/LOANMANAGER_REPAY_REQUESTED";
export const LOANMANAGER_REPAY_SUCCESS = "loanManager/LOANMANAGER_REPAY_SUCCESS";
export const LOANMANAGER_REPAY_ERROR = "loanManager/LOANMANAGER_REPAY_ERROR";

export const LOANMANAGER_COLLECT_REQUESTED = "loanManager/LOANMANAGER_COLLECT_REQUESTED";
export const LOANMANAGER_COLLECT_SUCCESS = "loanManager/LOANMANAGER_COLLECT_SUCCESS";
export const LOANMANAGER_COLLECT_ERROR = "loanManager/LOANMANAGER_COLLECT_ERROR";

export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED = "loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED";
export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED = "loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED";
export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR = "loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR";

const initialState = {
    contract: null,
    isConnected: false,
    isLoading: false,
    connectionError: null,
    result: null,
    error: null,
    products: null,
    info: {
        tokenBalance: "?",
        ethBalance: "?",
        owner: "?",
        ratesAddress: "?",
        augmintTokenAddress: "?",
        loanCount: "?",
        productCount: "?"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANMANAGER_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                connectionError: null,
                error: null
            };

        case LOANMANAGER_CONNECT_SUCCESS:
            return {
                ...state,
                contract: action.contract,
                isConnected: true,
                isLoading: false,
                connectionError: null
            };

        case LOANMANAGER_CONNECT_ERROR:
            return {
                ...state,
                connectionError: action.error,
                isConnected: false,
                isLoading: false
            };

        case LOANMANAGER_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case LOANMANAGER_REFRESHED:
            return {
                ...state,
                isLoading: false,
                info: action.result
            };

        case LOANMANAGER_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
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

        case LOANMANAGER_PRODUCTLIST_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case LOANMANAGER_NEWLOAN_REQUESTED:
            return {
                ...state,
                error: null,
                result: null,
                ethAmount: action.ethAmount,
                productId: action.productId
            };

        case LOANMANAGER_NEWLOAN_ERROR:
            return {
                ...state,
                error: action.error
            };

        case LOANMANAGER_NEWLOAN_CREATED:
            return {
                ...state,
                result: action.result
            };

        case LOANMANAGER_REPAY_REQUESTED:
            return {
                ...state,
                loanId: action.loandId,
                error: null,
                result: null
            };

        case LOANMANAGER_REPAY_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case LOANMANAGER_REPAY_ERROR:
            return {
                ...state,
                error: action.error
            };

        case LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED:
            return {
                ...state,
                loansToCollect: action.result,
                isLoading: false
            };

        case LOANMANAGER_COLLECT_REQUESTED:
            return {
                ...state,
                loansToCollect: action.loansToCollect,
                isLoading: false,
                error: null,
                result: null
            };

        case LOANMANAGER_COLLECT_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case LOANMANAGER_COLLECT_ERROR:
            return {
                ...state,
                error: action.error
            };

        default:
            return state;
    }
};

export const connectLoanManager = () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_CONNECT_REQUESTED
        });
        try {
            let contract = await SolidityContract.connectNew(
                store.getState().web3Connect.web3Instance,
                loanManager_artifacts
            );
            return dispatch({
                type: LOANMANAGER_CONNECT_SUCCESS,
                contract: contract
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_CONNECT_ERROR,
                error: error
            });
        }
    };
};

export const refreshLoanManager = () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_REFRESH_REQUESTED
        });
        try {
            const loanManager = store.getState().loanManager.contract.instance;
            const augmintToken = store.getState().augmintToken.contract.instance;
            // TODO: make calls paralel
            const loanCount = await loanManager.getLoanCount();
            const productCount = await loanManager.getProductCount();

            const augmintTokenAddress = await loanManager.augmintToken();
            const ratesAddress = await loanManager.rates();
            const owner = await loanManager.owner();

            const bn_ethBalance = await asyncGetBalance(loanManager.address);
            const bn_tokenBalance = (await augmintToken.balanceOf(loanManager.address)).div(10000);
            return dispatch({
                type: LOANMANAGER_REFRESHED,
                result: {
                    owner: owner,
                    bn_ethBalance: bn_ethBalance,
                    ethBalance: bn_ethBalance.toNumber(),
                    bn_tokenBalance: bn_tokenBalance,
                    tokenBalance: bn_tokenBalance.toNumber(),
                    loanCount: loanCount.toNumber(),
                    productCount: productCount.toNumber(),
                    augmintTokenAddress: augmintTokenAddress,
                    ratesAddress: ratesAddress
                }
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_REFRESH_ERROR,
                error: error
            });
        }
    };
};

export function fetchProducts() {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_PRODUCTLIST_REQUESTED
        });

        try {
            let result = await fetchProductsTx();
            return dispatch({
                type: LOANMANAGER_PRODUCTLIST_RECEIVED,
                products: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_PRODUCTLIST_ERROR,
                error: error
            });
        }
    };
}

export function newLoan(productId, ethAmount) {
    return async dispatch => {
        // TODO: shall we emmit error if already submitting or enough as it is (submit disabled on form)
        dispatch({
            type: LOANMANAGER_NEWLOAN_REQUESTED,
            ethAmount: ethAmount,
            productId: productId
        });

        try {
            let result = await newEthBackedLoanTx(productId, ethAmount);
            return dispatch({
                type: LOANMANAGER_NEWLOAN_CREATED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_NEWLOAN_ERROR,
                error: error
            });
        }
    };
}

export function repayLoan(loanId) {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_REPAY_REQUESTED,
            loanId: loanId
        });

        try {
            let result = await repayLoanTx(loanId);
            return dispatch({
                type: LOANMANAGER_REPAY_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_REPAY_ERROR,
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
            let result = await fetchLoansToCollectTx();
            return dispatch({
                type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR,
                error: error
            });
        }
    };
}

export function collectLoans(loansToCollect) {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_COLLECT_REQUESTED,
            loansToCollect: loansToCollect
        });

        try {
            let result = await collectLoansTx(loansToCollect);
            return dispatch({
                type: LOANMANAGER_COLLECT_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_COLLECT_ERROR,
                error: error
            });
        }
    };
}
