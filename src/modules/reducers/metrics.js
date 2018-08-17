import { fetchActiveLegacyLoansTx } from "modules/ethereum/metricsTransaction";

const LOANS_DATA_REFRESH_REQUESTED = "metrics/REFRESH_REQUESTED";
const LOANS_DATA_REFRESH_ERROR = "metrics/REFRESH_ERROR";
const LOANS_DATA_REFRESH_SUCCESS = "metrics/REFRESH_SUCCESS";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null,
    loansData: [],
    result: null,
    request: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANS_DATA_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                loadError: null
            };

        case LOANS_DATA_REFRESH_SUCCESS:
            return {
                ...state,
                loansData: action.result,
                isLoading: false,
                isLoaded: true,
                loadError: null
            };

        case LOANS_DATA_REFRESH_ERROR:
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
            type: LOANS_DATA_REFRESH_REQUESTED
        });
        try {
            const loansData = await fetchActiveLegacyLoansTx();
            return dispatch({
                type: LOANS_DATA_REFRESH_SUCCESS,
                result: loansData
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOANS_DATA_REFRESH_ERROR,
                error: error
            });
        }
    };
};
