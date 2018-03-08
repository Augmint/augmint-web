import { fetchTradesTx } from "modules/ethereum/tradeTransactions";

export const TRADE_REFRESH_REQUESTED = "trade/TRADE_REFRESH_REQUESTED";
export const TRADE_REFRESH_ERROR = "trade/TRADE_REFRESH_ERROR";
export const TRADE_REFRESH_SUCCESS = "trade/TRADE_REFRESH_SUCCESS";

const initialState = {
    error: null,
    connectionError: false,
    isLoading: false,
    isConnected: false,
    trades: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TRADE_REFRESH_REQUESTED:
            return {
                isLoading: true,
                account: action.account,
                fromBlock: action.fromBlock,
                toBlock: action.toBlock,
                ...state
            };

        case TRADE_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case TRADE_REFRESH_SUCCESS:
            return {
                ...state,
                trades: action.result,
                isLoading: false,
                isConnected: true,
                connectionError: false,
                error: null
            };

        default:
            return state;
    }
};

export const refreshTrades = (account, fromBlock, toBlock) => {
    return async dispatch => {
        dispatch({
            type: TRADE_REFRESH_REQUESTED,
            account: account,
            fromBlock: fromBlock,
            toBlock: toBlock
        });
        try {
            const trades = await fetchTradesTx(account, fromBlock, toBlock);

            return dispatch({
                type: TRADE_REFRESH_SUCCESS,
                result: trades,
            });
        } catch (error) {
            return dispatch({
                type: TRADE_REFRESH_ERROR,
                error: error
            });
        }
    };
};
