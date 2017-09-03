/* ETH and UCD balance for the active userAccount
    TODO: make this generic? ie. to use this for any address balances?
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import {
    fetchTransferListTx,
    processTransferTx
} from "modules/ethereum/transferTransactions";

export const USER_TRANSFERLIST_REQUESTED =
    "userTransfers/USER_TRANSFERLIST_REQUESTED";
export const USER_TRANSFERLIST_ERROR = "userBalances/USER_TRANSFERLIST_ERROR";
export const USER_TRANSFERLIST_RECEIVED =
    "userTransfers/USER_TRANSFERLIST_RECEIVED";

export const USER_TRANSFERTX_FETCH_REQUESTED =
    "userTransfers/USER_TRANSFERTX_FETCH_REQUESTED";
export const USER_TRANSFERTX_FETCH_ERROR =
    "userTransfers/USER_TRANSFERTX_FETCH_ERROR";
export const USER_TRANSFERTX_FETCH_RECEIVED =
    "userTransfers/USER_TRANSFERTX_FETCH_RECEIVED";

const initialState = {
    transfers: null,
    isLoading: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case USER_TRANSFERLIST_REQUESTED:
            return {
                ...state,
                isLoading: true,
                address: action.address,
                fromBlock: action.fromBlock,
                toBlock: action.toBlock
            };

        case USER_TRANSFERLIST_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case USER_TRANSFERLIST_RECEIVED:
            return {
                ...state,
                isLoading: false,
                transfers: action.result
            };

        case USER_TRANSFERTX_FETCH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                address: action.address,
                fromBlock: action.fromBlock,
                toBlock: action.toBlock
            };

        case USER_TRANSFERTX_FETCH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case USER_TRANSFERTX_FETCH_RECEIVED:
            return {
                ...state,
                isLoading: false,
                transfers: action.result
            };

        default:
            return state;
    }
};

export function fetchTransferList(address, fromBlock, toBlock) {
    return async dispatch => {
        dispatch({
            type: USER_TRANSFERLIST_REQUESTED,
            address: address,
            fromBlock: fromBlock,
            toBlock: toBlock
        });
        try {
            let result = await fetchTransferListTx(address, fromBlock, toBlock);
            return dispatch({
                type: USER_TRANSFERLIST_RECEIVED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: USER_TRANSFERLIST_ERROR,
                error: error
            });
        }
    };
}

export function processTransfer(address, tx) {
    return async dispatch => {
        dispatch({
            type: USER_TRANSFERTX_FETCH_REQUESTED,
            address: address,
            tx: tx
        });

        try {
            let result = await processTransferTx(address, tx);
            return dispatch({
                type: USER_TRANSFERTX_FETCH_RECEIVED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: USER_TRANSFERTX_FETCH_ERROR,
                error: error
            });
        }
    };
}
