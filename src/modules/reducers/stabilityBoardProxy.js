import store from "modules/store";
import { fetchScriptsTx, fetchSignersTx } from "modules/ethereum/multiSigTransactions";

export const STABILITYBOARD_REFRESH_REQUESTED = "stabilityBoardProxy/REFRESH_REQUESTED";
export const STABILITYBOARD_REFRESH_ERROR = "stabilityBoardProxy/REFRESH_ERROR";
export const STABILITYBOARD_REFRESH_DONE = "stabilityBoardProxy/REFRESH_DONE";

export const FETCH_SCRIPTS_REQUESTED = "stabilityBoardProxy/FETCH_SCRIPTS_REQUESTED";
export const FETCH_SCRIPTS_ERROR = "stabilityBoardProxy/FETCH_SCRIPTS_ERROR";
export const FETCH_SCRIPTS_DONE = "stabilityBoardProxy/FETCH_SCRIPTS_DONE";

export const FETCH_SIGNERS_REQUESTED = "stabilityBoardProxy/FETCH_SIGNERS_REQUESTED";
export const FETCH_SIGNERS_ERROR = "stabilityBoardProxy/FETCH_SIGNERS_ERROR";
export const FETCH_SIGNERS_DONE = "stabilityBoardProxy/PROCESS_NEW_LOCK_DONE";

const initialState = {
    info: { activeSignersCount: "?" },
    scripts: [],
    signers: [],
    isLoading: false,
    isLoaded: false,
    loadError: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case STABILITYBOARD_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case STABILITYBOARD_REFRESH_DONE:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                info: action.info
            };

        case STABILITYBOARD_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                loadError: action.error
            };

        case FETCH_SCRIPTS_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case FETCH_SIGNERS_REQUESTED:
            return {
                ...state,
                account: action.account,
                lockData: action.lockData,
                isLoading: true
            };

        case FETCH_SCRIPTS_DONE:
            return {
                ...state,
                isLoading: false,
                scripts: action.result
            };
        case FETCH_SIGNERS_DONE:
            return {
                ...state,
                isLoading: false,
                signers: action.result
            };

        case FETCH_SCRIPTS_ERROR:
        case FETCH_SIGNERS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export function refreshStabilityBoardProxy() {
    return async dispatch => {
        dispatch({
            type: STABILITYBOARD_REFRESH_REQUESTED
        });
        try {
            const stabilityBoardProxyInstance = store.getState().contracts.latest.stabilityBoardProxy
                .web3ContractInstance;
            const activeSignersCount = await stabilityBoardProxyInstance.methods.activeSignersCount().call();
            const info = { activeSignersCount };
            return dispatch({
                type: STABILITYBOARD_REFRESH_DONE,
                info
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: STABILITYBOARD_REFRESH_ERROR,
                error: error
            });
        }
    };
}

export function fetchScripts() {
    return async dispatch => {
        dispatch({ type: FETCH_SCRIPTS_REQUESTED });
        try {
            const stabilityBoardProxyInstance = store.getState().contracts.latest.stabilityBoardProxy
                .web3ContractInstance;
            const scripts = await fetchScriptsTx(stabilityBoardProxyInstance);

            scripts.sort((a, b) => {
                return b.id > a.id;
            });

            return dispatch({
                type: FETCH_SCRIPTS_DONE,
                result: scripts
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: FETCH_SCRIPTS_ERROR,
                error: error
            });
        }
    };
}

export function fetchSigners() {
    return async dispatch => {
        dispatch({ type: FETCH_SIGNERS_REQUESTED });
        try {
            const stabilityBoardProxyInstance = store.getState().contracts.latest.stabilityBoardProxy
                .web3ContractInstance;
            const signers = await fetchSignersTx(stabilityBoardProxyInstance);

            signers.sort((a, b) => {
                return b.id > a.id;
            });

            return dispatch({
                type: FETCH_SIGNERS_DONE,
                result: signers
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: FETCH_SIGNERS_ERROR,
                error: error
            });
        }
    };
}
