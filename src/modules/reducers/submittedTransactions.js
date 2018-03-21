import store from "modules/store";

export const UPDATE_TX_SUCCESS = "submittedTransactions/UPDATE_TX_SUCCESS";
export const UPDATE_TX_ERROR = "submittedTransactions/UPDATE_TX_ERROR";

export const DISMISS_TX_SUCCESS = "submittedTransactions/DISMISS_TX_SUCCESS";
export const DISMISS_TX_ERROR = "submittedTransactions/DISMISS_TX_ERROR";

const initialState = {};

export default (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_TX_SUCCESS:
        case DISMISS_TX_SUCCESS:
            return {
                ...state,
                transactions: action.result
            };

        case UPDATE_TX_ERROR:
        case DISMISS_TX_ERROR:
            return {
                ...state,
                error: action.error
            };

        default:
            return state;
    }
};

export const updateTx = tx => {
    return async dispatch => {
        try {
            const transactions = Object.assign({}, store.getState().submittedTransactions.transactions);
            const updatedTx = Object.assign({}, transactions[tx.transactionHash], tx);
            transactions[tx.transactionHash] = updatedTx;

            return dispatch({
                type: UPDATE_TX_SUCCESS,
                result: transactions
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: UPDATE_TX_ERROR,
                error
            });
        }
    };
};

export const dismissTx = txHash => {
    return async dispatch => {
        try {
            const transactions = Object.assign({}, store.getState().submittedTransactions.transactions);
            delete transactions[txHash];
            console.debug("transactions", txHash, transactions);
            return dispatch({
                type: DISMISS_TX_SUCCESS,
                result: transactions
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: DISMISS_TX_ERROR,
                error
            });
        }
    };
};
