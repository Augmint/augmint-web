/* Loans for one account
    TODO: do some caching. consider selectors for it: https://github.com/reactjs/reselect
    TODO: add listener to new loan event & refresh loans if it's the current users'
    TODO: move formating to separate lib (from all modules)
*/
import store from "modules/store";
import { fetchLoanDetails } from "modules/ethereum/loanTransactions";

export const LOANS_LOANLIST_REQUESTED = "loans/LOANS_LOANLIST_REQUESTED";
export const LOANS_LOANLIST_RECEIVED = "loans/LOANS_LOANLIST_RECEIVED";

const initialState = {
    loans: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANS_LOANLIST_REQUESTED:
            return state;

        case LOANS_LOANLIST_RECEIVED:
            return {
                ...state,
                loans: action.loans
            };

        default:
            return state;
    }
};

export function fetchLoans(userAccount) {
    return async dispatch => {
        dispatch({
            type: LOANS_LOANLIST_REQUESTED
        });
        let loanIds, loanManager;
        try {
            loanManager = store.getState().loanManager.contract.instance;
            loanIds = await loanManager.getLoanIds(userAccount);

            let actions = loanIds.map(fetchLoanDetails);
            let loans = await Promise.all(actions); // queries in paralel...

            return dispatch({
                type: LOANS_LOANLIST_RECEIVED,
                loans: loans
            });
        } catch (error) {
            // TODO: dispatch a LOANS_LOANLIST_ERROR and add an action.error state
            let err = new Error(
                "Error in fetchLoans. \n userAccount: " + userAccount,
                +"\n loanIds: " + loanIds,
                +"\n" + error
            );
            console.error(err);
            throw err;
        }
    };
}
