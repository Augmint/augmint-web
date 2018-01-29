/* ETH and token balance for the active userAccount
    TODO: make this generic? ie. to use this for any address balances?
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import store from "modules/store";
import { fetchTransfersTx, processNewTransferTx } from "modules/ethereum/transferTransactions";

export const FETCH_TRANSFERS_REQUESTED = "userTransfers/FETCH_TRANSFERS_REQUESTED";
export const FETCH_TRANSFERS_ERROR = "userBalances/FETCH_TRANSFERS_ERROR";
export const FETCH_TRANSFERS_RECEIVED = "userTransfers/FETCH_TRANSFERS_RECEIVED";

export const PROCESS_NEW_TRANSFER_REQUESTED = "userTransfers/PROCESS_NEW_TRANSFER_REQUESTED";
export const PROCESS_NEW_TRANSFER_ERROR = "userTransfers/PROCESS_NEW_TRANSFER_ERROR";
export const PROCESS_NEW_TRANSFER_DONE = "userTransfers/PROCESS_NEW_TRANSFER_DONE";

const initialState = {
    transfers: null,
    isLoading: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCH_TRANSFERS_REQUESTED:
            return {
                ...state,
                isLoading: true,
                account: action.account,
                fromBlock: action.fromBlock,
                toBlock: action.toBlock
            };

        case PROCESS_NEW_TRANSFER_REQUESTED:
            return {
                ...state,
                isLoading: true,
                transfers: action.transfers
            };

        case FETCH_TRANSFERS_RECEIVED:
        case PROCESS_NEW_TRANSFER_DONE:
            return {
                ...state,
                isLoading: false,
                transfers: action.result
            };

        case FETCH_TRANSFERS_ERROR:
        case PROCESS_NEW_TRANSFER_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export function fetchTransfers(account, fromBlock, toBlock) {
    return async dispatch => {
        dispatch({
            type: FETCH_TRANSFERS_REQUESTED,
            account: account,
            fromBlock: fromBlock,
            toBlock: toBlock
        });
        try {
            const result = await fetchTransfersTx(account, fromBlock, toBlock);
            result.sort((a, b) => {
                return b.blockTimeStamp > a.blockTimeStamp;
            });

            return dispatch({
                type: FETCH_TRANSFERS_RECEIVED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: FETCH_TRANSFERS_ERROR,
                error: error
            });
        }
    };
}

export function processNewTransfer(account, eventLog) {
    return async dispatch => {
        dispatch({
            type: PROCESS_NEW_TRANSFER_REQUESTED,
            eventLog: eventLog
        });

        try {
            const newTransfer = await processNewTransferTx(account, eventLog);

            let transfers = store.getState().userTransfers.transfers;
            if (!transfers) {
                transfers = [];
            }
            if (!transfers.find(a => a.transationHash === newTransfer.transactionHash)) {
                transfers.push(newTransfer);
                transfers.sort((a, b) => {
                    return b.blockTimeStamp > a.blockTimeStamp;
                });
            }

            return dispatch({
                type: PROCESS_NEW_TRANSFER_DONE,
                result: transfers
            });
        } catch (error) {
            return dispatch({
                type: PROCESS_NEW_TRANSFER_ERROR,
                error: error
            });
        }
    };
}
