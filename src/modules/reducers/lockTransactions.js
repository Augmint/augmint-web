import { newLockTx } from "modules/ethereum/lockTransactions";

const LOCKTRANSACTIONS_NEWLOCK_REQUESTED = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_REQUESTED";
const LOCKTRANSACTIONS_NEWLOCK_ERROR = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_ERROR";
export const LOCKTRANSACTIONS_NEWLOCK_CREATED = "lockTransactions/LOCKTRANSACTIONS_NEWLOCK_CREATED";

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
            console.log(error);
            return dispatch({
                type: LOCKTRANSACTIONS_NEWLOCK_ERROR,
                error: error
            });
        }
    };
}
