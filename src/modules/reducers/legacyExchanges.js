import store from "modules/store";
import { fetchLegacyExchangeOrders, cancelLegacyExchangeOrderTx } from "modules/ethereum/legacyExchangesTransactions";

const LEGACY_EXCHANGES_REFRESH_REQUESTED = "legacyExchanges/LEGACY_EXCHANGES_REFRESH_REQUESTED";
const LEGACY_EXCHANGES_REFRESH_ERROR = "legacyExchanges/LEGACY_EXCHANGES_REFRESH_ERROR";
const LEGACY_EXCHANGES_REFRESH_SUCCESS = "legacyExchanges/LEGACY_EXCHANGES_REFRESH_SUCCESS";

const LEGACY_EXCHANGES_DISMISS_REQUESTED = "legacyExchanges/LEGACY_EXCHANGES_DISMISS_REQUESTED";
const LEGACY_EXCHANGES_DISMISS_ERROR = "legacyExchanges/LEGACY_EXCHANGES_DISMISS_ERROR";
const LEGACY_EXCHANGES_DISMISS_SUCCESS = "legacyExchanges/LEGACY_EXCHANGES_DISMISS_SUCCESS";

const LEGACY_EXCHANGES_CANCEL_ORDER_REQUESTED = "legacyExchanges/LEGACY_EXCHANGES_CANCEL_ORDER_REQUESTED";
const LEGACY_EXCHANGES_CANCEL_ORDER_ERROR = "legacyExchanges/LEGACY_EXCHANGES_CANCEL_ORDER_ERROR";
export const LEGACY_EXCHANGES_CANCEL_ORDER_SUCCESS = "legacyExchanges/LEGACY_EXCHANGES_CANCEL_ORDER_SUCCESS";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null,
    contracts: [],
    result: null,
    request: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LEGACY_EXCHANGES_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                loadError: null
            };

        case LEGACY_EXCHANGES_REFRESH_SUCCESS:
            return {
                ...state,
                contracts: action.result,
                isLoading: false,
                isLoaded: true,
                loadError: null
            };

        case LEGACY_EXCHANGES_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                refreshError: action.error
            };

        case LEGACY_EXCHANGES_CANCEL_ORDER_REQUESTED:
        case LEGACY_EXCHANGES_DISMISS_REQUESTED:
            return {
                ...state,
                request: action.request
            };

        case LEGACY_EXCHANGES_CANCEL_ORDER_SUCCESS:
            return {
                ...state,
                result: action.result,
                contracts: action.contracts,
                request: null
            };

        case LEGACY_EXCHANGES_CANCEL_ORDER_ERROR:
        case LEGACY_EXCHANGES_DISMISS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error,
                request: null
            };

        case LEGACY_EXCHANGES_DISMISS_SUCCESS:
            return {
                ...state,
                contracts: action.result,
                request: null
            };

        default:
            return state;
    }
};

export const refreshLegacyExchanges = () => {
    return async dispatch => {
        dispatch({
            type: LEGACY_EXCHANGES_REFRESH_REQUESTED
        });
        try {
            const contracts = await fetchLegacyExchangeOrders();
            return dispatch({
                type: LEGACY_EXCHANGES_REFRESH_SUCCESS,
                result: contracts
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_EXCHANGES_REFRESH_ERROR,
                error: error
            });
        }
    };
};

export function dismissLegacyExchange(legacyExchangeAddress) {
    return async dispatch => {
        dispatch({
            type: LEGACY_EXCHANGES_DISMISS_REQUESTED,
            request: { legacyExchangeAddress }
        });
        try {
            const contracts = [...store.getState().legacyExchanges.contracts];

            const index = contracts.findIndex(item => item.address === legacyExchangeAddress);
            contracts[index].isDismissed = true;

            return dispatch({
                type: LEGACY_EXCHANGES_DISMISS_SUCCESS,
                result: contracts
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_EXCHANGES_DISMISS_ERROR,
                error: error
            });
        }
    };
}

export function cancelLegacyExchangeOrder(legacyExchangeAddress, direction, orderId) {
    return async dispatch => {
        dispatch({
            type: LEGACY_EXCHANGES_CANCEL_ORDER_REQUESTED,
            request: { legacyExchangeAddress, direction, orderId }
        });

        try {
            const contracts = [...store.getState().legacyExchanges.contracts];
            const result = await cancelLegacyExchangeOrderTx(legacyExchangeAddress, direction, orderId);

            const contractIndex = contracts.findIndex(contract => contract.address === legacyExchangeAddress);
            const orderIndex = contracts[contractIndex].userOrders.findIndex(order => order.id === orderId);
            // TODO: add a callback from OrderCancel event on legacyExchange then refresh legacyExchanges.
            contracts[contractIndex].userOrders[orderIndex].isSubmitted = true;

            return dispatch({
                type: LEGACY_EXCHANGES_CANCEL_ORDER_SUCCESS,
                result,
                contracts
            });
        } catch (error) {
            return dispatch({
                type: LEGACY_EXCHANGES_CANCEL_ORDER_ERROR,
                error: error
            });
        }
    };
}
