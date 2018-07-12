import store from "modules/store";
import { fetchActiveLegacyLoansTx } from "modules/ethereum/legacyLoanManagersTransactions";

const ALL_LOAN_REFRESH_REQUESTED = "legacyLoanManagers/REFRESH_REQUESTED";
const ALL_LOAN_REFRESH_ERROR = "legacyLoanManagers/REFRESH_ERROR";
const ALL_LOAN_REFRESH_SUCCESS = "legacyLoanManagers/REFRESH_SUCCESS";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null,
    loans: [],
    result: null,
    request: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ALL_LOAN_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                loadError: null
            };

        case ALL_LOAN_REFRESH_SUCCESS:
            return {
                ...state,
                loans: action.result,
                isLoading: false,
                isLoaded: true,
                loadError: null
            };

        case ALL_LOAN_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                refreshError: action.error
            };

        default:
            return state;
    }
};

export const fetchAllLoans = () => {
    return async dispatch => {
        dispatch({
            type: ALL_LOAN_REFRESH_REQUESTED
        });
        try {
            const loans = await fetchActiveLegacyLoansTx();
            return dispatch({
                type: ALL_LOAN_REFRESH_SUCCESS,
                result: loans
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: ALL_LOAN_REFRESH_ERROR,
                error: error
            });
        }
    };
};
