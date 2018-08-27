import store from "modules/store";
import { fetchLocksForAddressTx, processNewLockTx } from "modules/ethereum/lockTransactions";

export const FETCH_LOCKS_REQUESTED = "locks/FETCH_LOCKS_REQUESTED";
export const FETCH_LOCKS_ERROR = "locks/FETCH_LOCKS_ERROR";
export const FETCH_LOCKS_DONE = "locks/FETCH_LOCKS_DONE";

export const PROCESS_NEW_LOCK_REQUESTED = "locks/PROCESS_NEW_LOCK_REQUESTED";
export const PROCESS_NEW_LOCK_ERROR = "locks/PROCESS_NEW_LOCK_ERROR";
export const PROCESS_NEW_LOCK_DONE = "locks/PROCESS_NEW_LOCK_DONE";

const initialState = {
    locks: [],
    isLoading: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case FETCH_LOCKS_REQUESTED:
            return {
                ...state,
                isLoading: true,
                account: action.account
            };

        case PROCESS_NEW_LOCK_REQUESTED:
            return {
                ...state,
                account: action.account,
                lockData: action.lockData,
                isLoading: true
            };

        case FETCH_LOCKS_DONE:
        case PROCESS_NEW_LOCK_DONE:
            return {
                ...state,
                isLoading: false,
                locks: action.result
            };

        case FETCH_LOCKS_ERROR:
        case PROCESS_NEW_LOCK_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export function fetchLocksForAddress(account) {
    return async dispatch => {
        dispatch({
            type: FETCH_LOCKS_REQUESTED,
            account: account
        });
        try {
            const lockManagerInstance = store.getState().contracts.latest.lockManager.web3ContractInstance;
            const locks = await fetchLocksForAddressTx(lockManagerInstance, account);

            locks.sort((a, b) => {
                return b.id - a.id;
            });

            return dispatch({
                type: FETCH_LOCKS_DONE,
                result: locks
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: FETCH_LOCKS_ERROR,
                error: error
            });
        }
    };
}

export function processNewLock(account, lockData) {
    return async dispatch => {
        dispatch({
            type: PROCESS_NEW_LOCK_REQUESTED,
            account,
            lockData
        });

        try {
            const locksInStore = store.getState().locks.locks;
            let locks;
            if (locksInStore.findIndex(a => a.id === lockData.lockId.toNumber()) >= 0) {
                // add lock only if it's unique: newLock event retriggered on page load with ganache when new lock is
                // in the last block. In such case the same lock was already processed by fetchLocksForAddress
                locks = locksInStore;
            } else {
                const newLock = await processNewLockTx(account, lockData);
                locks = [...locksInStore, newLock].sort((a, b) => {
                    return b.id - a.id;
                });
            }

            return dispatch({
                type: PROCESS_NEW_LOCK_DONE,
                result: locks
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: PROCESS_NEW_LOCK_ERROR,
                error: error
            });
        }
    };
}
