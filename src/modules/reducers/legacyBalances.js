import store from "modules/store";
import { fetchLegacyBalances, convertLegacyBalanceTx } from "modules/ethereum/legacyBalancesTransactions";

export const LEGACY_BALANCE_REFRESH_REQUESTED = "legacyBalances/LEGACY_BALANCE_REFRESH_REQUESTED";
export const LEGACY_BALANCE_REFRESH_ERROR = "legacyBalances/LEGACY_BALANCE_REFRESH_ERROR";
export const LEGACY_BALANCE_REFRESH_SUCCESS = "legacyBalances/LEGACY_BALANCE_REFRESH_SUCCESS";

export const LEGACY_BALANCE_DISMISS_REQUESTED = "legacyBalances/LEGACY_BALANCE_DISMISS_REQUESTED";
export const LEGACY_BALANCE_DISMISS_ERROR = "legacyBalances/LEGACY_BALANCE_DISMISS_ERROR";
export const LEGACY_BALANCE_DISMISS_SUCCESS = "legacyBalances/LEGACY_BALANCE_DISMISS_SUCCESS";

export const LEGACY_BALANCE_CONVERSION_REQUESTED = "legacyBalances/LEGACY_BALANCE_CONVERSION_REQUESTED";
export const LEGACY_BALANCE_CONVERSION_ERROR = "legacyBalances/LEGACY_BALANCE_CONVERSION_ERROR";
export const LEGACY_BALANCE_CONVERSION_SUCCESS = "legacyBalances/LEGACY_BALANCE_CONVERSION_SUCCESS";

const initialState = {
    refreshError: null,
    error: null,
    isLoading: false,
    contractBalances: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LEGACY_BALANCE_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                refreshError: null
            };

        case LEGACY_BALANCE_REFRESH_SUCCESS:
            return {
                ...state,
                contractBalances: action.result,
                isLoading: false,
                refreshError: null
            };

        case LEGACY_BALANCE_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                refreshError: action.error
            };

        case LEGACY_BALANCE_DISMISS_REQUESTED:
            return {
                ...state
            };

        case LEGACY_BALANCE_CONVERSION_SUCCESS:
            return {
                ...state,
                contractBalances: action.result
            };

        case LEGACY_BALANCE_CONVERSION_ERROR:
        case LEGACY_BALANCE_DISMISS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case LEGACY_BALANCE_DISMISS_SUCCESS:
            return {
                ...state,
                contractBalances: action.result
            };

        default:
            return state;
    }
};

export const refreshLegacyBalances = () => {
    return async dispatch => {
        dispatch({
            type: LEGACY_BALANCE_REFRESH_REQUESTED
        });
        try {
            const contractBalances = await fetchLegacyBalances();
            return dispatch({
                type: LEGACY_BALANCE_REFRESH_SUCCESS,
                result: contractBalances
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_BALANCE_REFRESH_ERROR,
                error: error
            });
        }
    };
};

export function dismissLegacyBalance(legacyTokenAddress) {
    return async dispatch => {
        dispatch({
            type: LEGACY_BALANCE_DISMISS_REQUESTED,
            legacyTokenAddress
        });
        try {
            const contractBalances = [...store.getState().legacyBalances.contractBalances];
            // TODO: shall we use tokenAddress as key instead of using an array?

            const index = contractBalances.findIndex(item => item.contract === legacyTokenAddress);
            contractBalances[index].isDismissed = true;

            return dispatch({
                type: LEGACY_BALANCE_DISMISS_SUCCESS,
                result: contractBalances
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_BALANCE_DISMISS_ERROR,
                error: error
            });
        }
    };
}

export function convertLegacyBalance(legacyTokenAddress) {
    return async dispatch => {
        dispatch({
            type: LEGACY_BALANCE_CONVERSION_REQUESTED,
            legacyTokenAddress
        });

        try {
            const result = await convertLegacyBalanceTx(legacyTokenAddress);
            return dispatch({
                type: LEGACY_BALANCE_CONVERSION_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LEGACY_BALANCE_CONVERSION_ERROR,
                error: error
            });
        }
    };
}
