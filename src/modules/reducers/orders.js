import { fetchOrders } from "modules/ethereum/exchangeTransactions";

export const ORDERS_REFRESH_REQUESTED = "orders/ORDERS_REFRESH_REQUESTED";
export const ORDERS_REFRESH_ERROR = "orders/ORDERS_REFRESH_ERROR";
export const ORDERS_REFRESH_SUCCESS = "orders/ORDERS_REFRESH_SUCCESS";

const initialState = {
    error: null,
    isLoading: true,
    orders: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ORDERS_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case ORDERS_REFRESH_SUCCESS:
            return {
                ...state,
                orders: action.result,
                isLoading: false,
                error: null
            };

        case ORDERS_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export const refreshOrders = () => {
    return async dispatch => {
        dispatch({
            type: ORDERS_REFRESH_REQUESTED
        });
        try {
            let orders = await fetchOrders();
            return dispatch({
                type: ORDERS_REFRESH_SUCCESS,
                result: orders
            });
        } catch (error) {
            return dispatch({
                type: ORDERS_REFRESH_ERROR,
                error: error
            });
        }
    };
};
