/* Loans for one account
    TODO: do some caching. consider selectors for it: https://github.com/reactjs/reselect
    TODO: add listener to new loan event & refresh loans if it's the current users'
    TODO: move formating to separate lib (from all modules)
*/
import store from "modules/store";
import { fetchLoanDetails } from "modules/ethereum/loanTransactions";

export const LOANS_LOANLIST_REQUESTED = "loans/LOANS_LOANLIST_REQUESTED";
export const LOANS_LOANLIST_RECEIVED = "loans/LOANS_LOANLIST_RECEIVED";
export const LOANS_LOANLIST_ERROR = "loans/LOANS_LOANLIST_ERROR";

const initialState = {
    loans: null,
    isLoading: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANS_LOANLIST_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case LOANS_LOANLIST_RECEIVED:
            return {
                ...state,
                isLoading: false,
                loans: action.loans
            };

        case LOANS_LOANLIST_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
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
            return dispatch({
                type: LOANS_LOANLIST_ERROR,
                error: error
            });
        }
    };
}
