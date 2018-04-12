import { newLockTx, releaseFundsTx } from "modules/ethereum/lockTransactions";

const LOCKTRANSACTIONS_NEWLOCK_REQUESTED = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_REQUESTED";
const LOCKTRANSACTIONS_NEWLOCK_ERROR = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_ERROR";
export const LOCKTRANSACTIONS_NEWLOCK_CREATED = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_CREATED";

const LOCKTRANSACTIONS_RELEASE_FUNDS_REQUESTED = "lockTransactions/LOCKTRANSACTIONS_RELEASE_FUNDS_REQUESTED";
const LOCKTRANSACTIONS_RELEASE_FUNDS_ERROR = "lockTransactions/LOCKTRANSACTIONS_RELEASE_FUNDS_ERROR";
export const LOCKTRANSACTIONS_RELEASE_FUNDS_SUCCESS = "lockTransactions/LOCKTRANSACTIONS_RELEASE_FUNDS_SUCCESS";

const initialState = {
    result: null,
    error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOCKTRANSACTIONS_NEWLOCK_REQUESTED:
            return {
                ...state,
                error: null,
                result: null,
                productId: action.productId,
                lockAmount: action.lockAmount
            };

        case LOCKTRANSACTIONS_RELEASE_FUNDS_REQUESTED:
            return {
                ...state,
                error: null,
                result: null,
                lockId: action.lockId
            };

        case LOCKTRANSACTIONS_NEWLOCK_CREATED:
        case LOCKTRANSACTIONS_RELEASE_FUNDS_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case LOCKTRANSACTIONS_NEWLOCK_ERROR:
        case LOCKTRANSACTIONS_RELEASE_FUNDS_ERROR:
            return {
                ...state,
                error: action.error
            };

        default:
            return state;
    }
};

export function newLock(productId, lockAmount) {
    return async dispatch => {
        dispatch({
            type: LOCKTRANSACTIONS_NEWLOCK_REQUESTED,
            lockAmount,
            productId
        });

        try {
            const result = await newLockTx(productId, lockAmount);
            return dispatch({
                type: LOCKTRANSACTIONS_NEWLOCK_CREATED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOCKTRANSACTIONS_NEWLOCK_ERROR,
                error: error
            });
        }
    };
}

export function releaseFunds(lockId) {
    return async dispatch => {
        dispatch({
            type: LOCKTRANSACTIONS_RELEASE_FUNDS_REQUESTED,
            lockId
        });

        try {
            const result = await releaseFundsTx(lockId);
            return dispatch({
                type: LOCKTRANSACTIONS_RELEASE_FUNDS_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOCKTRANSACTIONS_RELEASE_FUNDS_ERROR,
                error: error
            });
        }
    };
}
