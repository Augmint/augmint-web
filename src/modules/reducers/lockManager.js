import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import lockManagerArtifacts from "contractsBuild/Locker.json";

import { fetchLockProductsTx, newLockTx } from "modules/ethereum/lockTransactions";

const LOCKMANAGER_CONNECT_REQUESTED = "lockManager/LOCKMANAGER_CONNECT_REQUESTED";
const LOCKMANAGER_CONNECT_SUCCESS = "lockManager/LOCKMANAGER_CONNECT_SUCCESS";
const LOCKMANAGER_CONNECT_ERROR = "lockManager/LOCKMANAGER_CONNECT_ERROR";

const LOCKMANAGER_PRODUCTLIST_REQUESTED = "lockManager/LOCKMANAGER_PRODUCTLIST_REQUESTED";
const LOCKMANAGER_PRODUCTLIST_RECEIVED = "lockManager/LOCKMANAGER_PRODUCTLIST_RECEIVED";
const LOCKMANAGER_PRODUCTLIST_ERROR = "lockManager/LOCKMANAGER_PRODUCTLIST_ERROR";

const LOCKMANAGER_NEWLOCK_REQUESTED = "lockManager/LOCKMANAGER_NEWLOCK_REQUESTED";
const LOCKMANAGER_NEWLOCK_SUCCESS = "lockManager/LOCKMANAGER_NEWLOCK_SUCCESS";
const LOCKMANAGER_NEWLOCK_ERROR = "lockManager/LOCKMANAGER_NEWLOCK_ERROR";

const initialState = {
    contract: null,
    isConnected: false,
    isLoading: false,
    connectionError: null,
    result: null,
    error: null,
    products: null,
    info: {
        chunkSize: null,
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
        case LOCKMANAGER_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                connectionError: null,
                error: null
            };

        case LOCKMANAGER_CONNECT_SUCCESS:
            return {
                ...state,
                contract: action.contract,
                isConnected: true,
                isLoading: false,
                connectionError: null
            };

        case LOCKMANAGER_CONNECT_ERROR:
            return {
                ...state,
                connectionError: action.error,
                isConnected: false,
                isLoading: false
            };
        case LOCKMANAGER_PRODUCTLIST_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case LOCKMANAGER_PRODUCTLIST_RECEIVED:
            return {
                ...state,
                isLoading: false,
                products: action.products
            };
        default:
            return state;
    }
};

export const connectLockManager = () => {
    return async dispatch => {
        dispatch({
            type: LOCKMANAGER_CONNECT_REQUESTED
        });
        try {
            const contract = SolidityContract.connectNew(store.getState().web3Connect, lockManagerArtifacts);
            return dispatch({
                type: LOCKMANAGER_CONNECT_SUCCESS,
                contract
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOCKMANAGER_CONNECT_ERROR,
                error: error
            });
        }
    };
};

export function fetchProducts() {
    return async dispatch => {
        dispatch({
            type: LOCKMANAGER_PRODUCTLIST_REQUESTED
        });

        try {
            const result = await fetchLockProductsTx();
            return dispatch({
                type: LOCKMANAGER_PRODUCTLIST_RECEIVED,
                products: result
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOCKMANAGER_PRODUCTLIST_ERROR,
                error: error
            });
        }
    };
}
