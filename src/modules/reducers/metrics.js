import {
    fetchAllTokensInfo,
    fetchAllLoansInfo,
    fetchAllMonetarySupervisorInfo
} from "modules/ethereum/metricsTransaction";

const METRICS_DATA_REFRESH_REQUESTED = "metrics/REFRESH_REQUESTED";
const METRICS_DATA_REFRESH_ERROR = "metrics/REFRESH_ERROR";
const METRICS_DATA_REFRESH_SUCCESS = "metrics/REFRESH_SUCCESS";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    loansData: {},
    augmintTokenInfo: {},
    monetarySupervisorInfo: {}
};

export default (state = initialState, action) => {
    switch (action.type) {
        case METRICS_DATA_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                loadError: null
            };

        case METRICS_DATA_REFRESH_SUCCESS:
            return {
                ...state,
                ...action.result,
                isLoading: false,
                isLoaded: true,
                loadError: null
            };

        case METRICS_DATA_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                loadError: action.error
            };

        default:
            return state;
    }
};

export const fetchAllData = () => {
    return async dispatch => {
        dispatch({
            type: METRICS_DATA_REFRESH_REQUESTED
        });
        try {
            const augmintTokenInfo = await fetchAllTokensInfo();
            const loansData = await fetchAllLoansInfo();
            const monetarySupervisorInfo = await fetchAllMonetarySupervisorInfo();

            return dispatch({
                type: METRICS_DATA_REFRESH_SUCCESS,
                result: { augmintTokenInfo, loansData, monetarySupervisorInfo }
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: METRICS_DATA_REFRESH_ERROR,
                error: error
            });
        }
    };
};
