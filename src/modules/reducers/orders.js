import store from "modules/store";
import {
    fetchOrders,
    placeOrderTx,
    matchMultipleOrdersTx,
    cancelOrderTx,
    getSimpleBuyCalc
} from "modules/ethereum/exchangeTransactions";

export const TOKEN_BUY = 0;
export const TOKEN_SELL = 1;

export const ORDERS_REFRESH_REQUESTED = "orders/ORDERS_REFRESH_REQUESTED";
export const ORDERS_REFRESH_ERROR = "orders/ORDERS_REFRESH_ERROR";
export const ORDERS_REFRESH_SUCCESS = "orders/ORDERS_REFRESH_SUCCESS";

export const PLACE_ORDER_REQUESTED = "orders/PLACE_ORDER_REQUESTED";
export const PLACE_ORDER_ERROR = "orders/PLACE_ORDER_ERROR";
export const PLACE_ORDER_SUCCESS = "orders/PLACE_ORDER_SUCCESS";

export const MATCH_MULTIPLE_ORDERS_REQUESTED = "orders/MATCH_MULTIPLE_ORDERS_REQUESTED";
export const MATCH_MULTIPLE_ORDERS_ERROR = "orders/MATCH_MULTIPLE_ORDERS_ERROR";
export const MATCH_MULTIPLE_ORDERS_SUCCESS = "orders/MATCH_MULTIPLE_ORDERS_SUCCESS";

export const CANCEL_ORDER_REQUESTED = "orders/CANCEL_ORDER_REQUESTED";
export const CANCEL_ORDER_ERROR = "orders/CANCEL_ORDER_ERROR";
export const CANCEL_ORDER_SUCCESS = "orders/CANCEL_ORDER_SUCCESS";

export const SIMPLE_BUY_REQUESTED = "orders/SIMPLE_BUY_REQUESTED";
export const SIMPLE_BUY_SUCCESS = "orders/SIMPLE_BUY_SUCCESS";
export const SIMPLE_BUY_ERROR = "orders/SIMPLE_BUY_ERROR";

const initialState = {
    refreshError: null,
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
                refreshError: null
            };

        case ORDERS_REFRESH_SUCCESS:
            return {
                ...state,
                orders: action.result,
                isLoading: false,
                refreshError: null
            };

        case ORDERS_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                refreshError: action.error
            };

        case PLACE_ORDER_ERROR:
        case MATCH_MULTIPLE_ORDERS_ERROR:
        case CANCEL_ORDER_ERROR:
        case SIMPLE_BUY_ERROR:
            return {
                ...state,
                error: action.error
            };

        case PLACE_ORDER_SUCCESS:
        case MATCH_MULTIPLE_ORDERS_SUCCESS:
        case CANCEL_ORDER_SUCCESS:
        case SIMPLE_BUY_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case PLACE_ORDER_REQUESTED:
            return {
                ...state,
                error: null,
                amount: action.amount,
                price: action.price,
                direction: action.orderType
            };

        case MATCH_MULTIPLE_ORDERS_REQUESTED:
            return {
                ...state,
                error: null
            };

        case CANCEL_ORDER_REQUESTED:
            return {
                ...state,
                error: null,
                buyOrder: action.buyOrder,
                sellOrder: action.sellOrder
            };

        case SIMPLE_BUY_REQUESTED:
            return {
                ...state,
                tokenAmount: 0,
                buy: true,
                rate: 0
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
            const orders = await fetchOrders();
            return dispatch({
                type: ORDERS_REFRESH_SUCCESS,
                result: orders
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: ORDERS_REFRESH_ERROR,
                error: error
            });
        }
    };
};

export function placeOrder(orderType, amount, price) {
    return async dispatch => {
        dispatch({
            type: PLACE_ORDER_REQUESTED,
            direction: orderType,
            price,
            amount
        });

        try {
            const buy = orderType === TOKEN_BUY;
            const result = await placeOrderTx(buy, amount, price);
            return dispatch({
                type: PLACE_ORDER_SUCCESS,
                result: result
            });
        } catch (error) {
            console.log(error);
            return dispatch({
                type: PLACE_ORDER_ERROR,
                error: error
            });
        }
    };
}

export function matchMultipleOrders() {
    return async dispatch => {
        dispatch({ type: MATCH_MULTIPLE_ORDERS_REQUESTED });

        try {
            const result = await matchMultipleOrdersTx();
            return dispatch({
                type: MATCH_MULTIPLE_ORDERS_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: MATCH_MULTIPLE_ORDERS_ERROR,
                error: error
            });
        }
    };
}

export function cancelOrder(order) {
    return async dispatch => {
        dispatch({
            type: CANCEL_ORDER_REQUESTED,
            order: order
        });

        try {
            const exchangeInstance = store.getState().contracts.latest.exchange.web3ContractInstance;
            const result = await cancelOrderTx(exchangeInstance, order.buy, order.id);
            return dispatch({
                type: CANCEL_ORDER_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: CANCEL_ORDER_ERROR,
                error: error
            });
        }
    };
}

export function getSimpleBuy(token, isBuy, rate) {
    return async dispatch => {
        dispatch({
            type: SIMPLE_BUY_REQUESTED,
            token,
            isBuy,
            rate
        });

        try {
            const result = await getSimpleBuyCalc(token, isBuy, rate);
            return dispatch({
                type: SIMPLE_BUY_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: SIMPLE_BUY_ERROR,
                error: error
            });
        }
    };
}
