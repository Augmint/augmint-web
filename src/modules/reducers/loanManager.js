/*
    TODO: use selectors. eg: https://github.com/reactjs/reselect
*/

import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import loanManagerArtifacts from "contractsBuild/LoanManager.json";

import { fetchLoansToCollectTx, fetchProductsTx } from "modules/ethereum/loanTransactions";

export const LOANMANAGER_CONNECT_REQUESTED = "loanManager/LOANMANAGER_CONNECT_REQUESTED";
export const LOANMANAGER_CONNECT_SUCCESS = "loanManager/LOANMANAGER_CONNECT_SUCCESS";
export const LOANMANAGER_CONNECT_ERROR = "loanManager/LOANMANAGER_CONNECT_ERROR";

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
    contract: null,
    isConnected: false,
    isLoading: false,
    connectionError: null,
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
        augmintTokenAddress: "?"
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

export const connectLoanManager = () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_CONNECT_REQUESTED
        });
        try {
            const contract = await SolidityContract.connectNew(store.getState().web3Connect, loanManagerArtifacts);
            return dispatch({
                type: LOANMANAGER_CONNECT_SUCCESS,
                contract: contract
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
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
            const ONE_ETH = 1000000000000000000;
            const web3 = store.getState().web3Connect.web3Instance;
            const loanManager = store.getState().loanManager.contract.instance;
            const augmintToken = store.getState().augmintToken.contract.instance;
            const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

            const [
                loanCount,
                productCount,
                augmintTokenAddress,
                ratesAddress,
                bn_weiBalance,
                bn_tokenBalance
            ] = await Promise.all([
                loanManager.getLoanCount(),
                loanManager.getProductCount(),

                loanManager.augmintToken(),
                loanManager.rates(),

                web3.eth.getBalance(loanManager.address),
                augmintToken.balanceOf(loanManager.address)
            ]);

            return dispatch({
                type: LOANMANAGER_REFRESHED,
                result: {
                    bn_weiBalance,
                    ethBalance: bn_weiBalance / ONE_ETH,
                    bn_tokenBalance,
                    tokenBalance: bn_tokenBalance / decimalsDiv,
                    loanCount: loanCount.toNumber(),
                    productCount: productCount.toNumber(),
                    augmintTokenAddress,
                    ratesAddress
                }
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

export function fetchProducts() {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_PRODUCTLIST_REQUESTED
        });

        try {
            const result = await fetchProductsTx();
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
