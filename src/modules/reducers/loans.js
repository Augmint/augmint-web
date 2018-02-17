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

        try {
            const loanManager = store.getState().loanManager.contract.instance;
            const loanIds = await loanManager.getLoanIds(userAccount);
            const actions = loanIds.map(fetchLoanDetails);
            const loans = await Promise.all(actions); // queries in paralel...

            return dispatch({
                type: LOANS_LOANLIST_RECEIVED,
                loans: loans
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LOANS_LOANLIST_ERROR,
                error: error
            });
        }
    };
}
