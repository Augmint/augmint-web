import { fetchLegacyBalances, convertLegacyBalanceTx } from "modules/ethereum/legacyBalancesTransactions";

export const LEGACY_BALANCE_REFRESH_REQUESTED = "legacyBalances/LEGACY_BALANCE_REFRESH_REQUESTED";
export const LEGACY_BALANCE_REFRESH_ERROR = "legacyBalances/LEGACY_BALANCE_REFRESH_ERROR";
export const LEGACY_BALANCE_REFRESH_SUCCESS = "legacyBalances/LEGACY_BALANCE_REFRESH_SUCCESS";

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

        case LEGACY_BALANCE_CONVERSION_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case LEGACY_BALANCE_CONVERSION_SUCCESS:
            return {
                ...state,
                result: action.result
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
