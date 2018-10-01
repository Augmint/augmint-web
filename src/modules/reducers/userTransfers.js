/* ETH and token balance for the active userAccount
    TODO: make this generic? ie. to use this for any address balances?
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import store from "modules/store";
import { fetchTransfersTx, processNewTransferTx } from "modules/ethereum/transferTransactions";
import { AVG_BLOCK_TIME } from "utils/constants";

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
                isLoading: true
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

export function fetchTransfers(account, fromBlock, toBlock, isAdditional) {
    if (!isAdditional) {
        // reset transfer state
        store.getState().userTransfers.fromBlock = null;
        store.getState().userTransfers.toBlock = null;
        store.getState().userTransfers.transfers = null;
    }

    return async dispatch => {
        dispatch({
            type: FETCH_TRANSFERS_REQUESTED,
            account: account,
            fromBlock: fromBlock,
            toBlock: toBlock
        });
        try {
            const transfers = await fetchTransfersTx(account, fromBlock, toBlock);

            transfers.sort((a, b) => {
                return b.blockNumber - a.blockNumber;
            });

            return dispatch({
                type: FETCH_TRANSFERS_RECEIVED,
                result: isAdditional ? store.getState().userTransfers.transfers.concat(transfers) : transfers
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: FETCH_TRANSFERS_ERROR,
                error: error
            });
        }
    };
}

export function fetchLatestTransfers(account, isAdditional) {
    const blockLimit = Math.round((30 * 24 * 60 * 60) / AVG_BLOCK_TIME); // 30 days

    return dispatch =>
        Promise.resolve(
            store.getState().userTransfers.fromBlock ||
                store.getState().contracts.latest.augmintToken.getLastBlockNumber()
        ).then(blockNumber => {
            return fetchTransfers(account, blockNumber - blockLimit, blockNumber, isAdditional)(dispatch);
        });
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

            if (!transfers.find(a => a.transactionHash === newTransfer.transactionHash)) {
                transfers.push(newTransfer);
                transfers.sort((a, b) => {
                    return b.blockNumber - a.blockNumber;
                });
            }

            return dispatch({
                type: PROCESS_NEW_TRANSFER_DONE,
                result: transfers
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: PROCESS_NEW_TRANSFER_ERROR,
                error: error
            });
        }
    };
}
