import store from "modules/store";
import { fetchTradesTx, processNewTradeTx } from "modules/ethereum/tradeTransactions";

export const TRADE_FETCH_REQUESTED = "trade/TRADE_FETCH_REQUESTED";
export const TRADE_FETCH_ERROR = "trade/TRADE_FETCH_ERROR";
export const TRADE_FETCH_SUCCESS = "trade/TRADE_FETCH_SUCCESS";

export const TRADE_PROCESS_REQUESTED = "trade/TRADE_PROCESS_REQUESTED";
export const TRADE_PROCESS_ERROR = "trade/TRADE_PROCESS_ERROR";
export const TRADE_PROCESS_SUCCESS = "trade/TRADE_PROCESS_SUCCESS";

const initialState = {
    error: null,
    connectionError: false,
    isLoading: false,
    isConnected: false,
    trades: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TRADE_FETCH_REQUESTED:
            return {
                isLoading: true,
                account: action.account,
                fromBlock: action.fromBlock,
                toBlock: action.toBlock,
                ...state
            };

        case TRADE_FETCH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case TRADE_FETCH_SUCCESS:
            return {
                ...state,
                trades: action.result,
                isLoading: false,
                isConnected: true,
                connectionError: false,
                error: null
            };

        case TRADE_PROCESS_REQUESTED:
            return {
                isLoading: true,
                account: action.account,
                fromBlock: action.fromBlock,
                toBlock: action.toBlock,
                ...state
            };

        case TRADE_PROCESS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case TRADE_PROCESS_SUCCESS:
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

export const fetchTrades = (account, fromBlock, toBlock) => {
    return async dispatch => {
        dispatch({
            type: TRADE_FETCH_REQUESTED,
            account: account,
            fromBlock: fromBlock,
            toBlock: toBlock
        });
        try {
            const trades = await fetchTradesTx(account, fromBlock, toBlock);

            return dispatch({
                type: TRADE_FETCH_SUCCESS,
                result: trades,
            });
        } catch (error) {
            return dispatch({
                type: TRADE_FETCH_ERROR,
                error: error
            });
        }
    };
};

export const processNewTrade = (eventName, account, eventLog) => {
    return async dispatch => {
        dispatch({
            type: TRADE_PROCESS_REQUESTED,
            account: account,
            eventLog
        });
        try {
            const newTrade = await processNewTradeTx(eventName, account, eventLog);
            let trades = store.getState().trades.trades;

            if (!trades) {
              trades = [];
            }

            if (!trades.find(a => a.transactionHash === newTrade.transactionHash)) {
                trades.push(newTrade);
                console.log(trades);
                trades.sort((trade1, trade2) => {
                  return trade2.blockData.timestamp - trade1.blockData.timestamp;
                });
            }

            return dispatch({
                type: TRADE_PROCESS_SUCCESS,
                result: trades,
            });
        } catch (error) {
            return dispatch({
                type: TRADE_PROCESS_ERROR,
                error: error
            });
        }
    };
};
