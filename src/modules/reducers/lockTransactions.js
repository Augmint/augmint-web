import { newLockTx } from "modules/ethereum/lockTransactions";

const LOCKTRANSACTIONS_NEWLOCK_REQUESTED = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_REQUESTED";
const LOCKTRANSACTIONS_NEWLOCK_ERROR = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_ERROR";
export const LOCKTRANSACTIONS_NEWLOCK_CREATED = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_CREATED";

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

        case LOCKTRANSACTIONS_NEWLOCK_CREATED:
            return {
                ...state,
                result: action.result
            };

        case LOCKTRANSACTIONS_NEWLOCK_ERROR:
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
