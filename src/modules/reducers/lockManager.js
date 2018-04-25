import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import lockManagerArtifacts from "contractsBuild/Locker.json";

import { fetchLockProductsTx } from "modules/ethereum/lockTransactions";

import { ONE_ETH_IN_WEI } from "utils/constants";

const LOCKMANAGER_CONNECT_REQUESTED = "lockManager/LOCKMANAGER_CONNECT_REQUESTED";
const LOCKMANAGER_CONNECT_SUCCESS = "lockManager/LOCKMANAGER_CONNECT_SUCCESS";
const LOCKMANAGER_CONNECT_ERROR = "lockManager/LOCKMANAGER_CONNECT_ERROR";

const LOCKMANAGER_REFRESH_REQUESTED = "lockManager/LOCKMANAGER_REFRESH_REQUESTED";
const LOCKMANAGER_REFRESHED = "lockManager/LOCKMANAGER_REFRESHED";
const LOCKMANAGER_REFRESH_ERROR = "lockManager/LOCKMANAGER_REFRESH_ERROR";

const LOCKMANAGER_PRODUCTLIST_REQUESTED = "lockManager/LOCKMANAGER_PRODUCTLIST_REQUESTED";
const LOCKMANAGER_PRODUCTLIST_RECEIVED = "lockManager/LOCKMANAGER_PRODUCTLIST_RECEIVED";
const LOCKMANAGER_PRODUCTLIST_ERROR = "lockManager/LOCKMANAGER_PRODUCTLIST_ERROR";

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
        lockCount: "?",
        productCount: null,
        augmintTokenAddress: "?",
        monetarySupervisorAddress: "?"
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

        case LOCKMANAGER_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case LOCKMANAGER_REFRESHED:
            return {
                ...state,
                isLoading: false,
                info: action.info
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

        case LOCKMANAGER_PRODUCTLIST_ERROR:
        case LOCKMANAGER_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
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

export const refreshLockManager = () => {
    return async dispatch => {
        dispatch({
            type: LOCKMANAGER_REFRESH_REQUESTED
        });
        try {
            const lockManagerInstance = store.getState().lockManager.contract.web3ContractInstance;
            const info = await getLockManagerInfo(lockManagerInstance);
            return dispatch({
                type: LOCKMANAGER_REFRESHED,
                info
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOCKMANAGER_REFRESH_ERROR,
                error: error
            });
        }
    };
};

export function fetchLockProducts() {
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

async function getLockManagerInfo(lockManagerInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const augmintToken = store.getState().augmintToken.contract.web3ContractInstance;
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    const [
        chunkSize,
        lockCount,
        productCount,
        augmintTokenAddress,
        monetarySupervisorAddress,
        bn_weiBalance,
        bn_tokenBalance
    ] = await Promise.all([
        lockManagerInstance.methods.CHUNK_SIZE().call(),
        lockManagerInstance.methods.getLockCount().call(),
        lockManagerInstance.methods.getLockProductCount().call(),

        lockManagerInstance.methods.augmintToken().call(),
        lockManagerInstance.methods.monetarySupervisor().call(),

        web3.eth.getBalance(lockManagerInstance._address),
        augmintToken.methods.balanceOf(lockManagerInstance._address).call()
    ]);

    return {
        chunkSize: parseInt(chunkSize, 10),
        bn_weiBalance,
        ethBalance: bn_weiBalance / ONE_ETH_IN_WEI,
        bn_tokenBalance,
        tokenBalance: bn_tokenBalance / decimalsDiv,
        lockCount: parseInt(lockCount, 10),
        productCount: parseInt(productCount, 10),
        augmintTokenAddress,
        monetarySupervisorAddress
    };
}
