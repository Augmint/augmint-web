/* Loans for one account
    TODO: consider selectors https://github.com/reactjs/reselect */
import store from "modules/store";
import { fetchAllLoansTx } from "modules/ethereum/loanTransactions";

export const LOANS_LOANLIST_REQUESTED = "loans/LOANLIST_REQUESTED";
export const LOANS_LOANLIST_RECEIVED = "loans/LOANLIST_RECEIVED";
export const LOANS_LOANLIST_ERROR = "loans/LOANLIST_ERROR";

export const LOANS_FETCH_ALL_REQUESTED = "loans/FETCH_ALL_REQUESTED";
export const LOANS_FETCH_ALL_RECEIVED = "loans/FETCH_ALL_RECEIVED";
export const LOANS_FETCH_ALL_ERROR = "loans/FETCH_ALL_ERROR";

const initialState = {
    loans: null,
    allLoans: null,
    isLoading: false,
    isLoaded: false,
    loadError: null
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
                isLoaded: true,
                loans: action.loans
            };

        case LOANS_FETCH_ALL_REQUESTED:
            return {
                ...state,
                error: null,
                isLoading: true
            };

        case LOANS_FETCH_ALL_RECEIVED:
            return {
                ...state,
                isLoading: false,
                allLoans: action.result
            };

        case LOANS_FETCH_ALL_ERROR:
        case LOANS_LOANLIST_ERROR:
            return {
                ...state,
                isLoading: false,
                loadError: action.error
            };

        default:
            return state;
    }
};

export function fetchAllLoans() {
    return async dispatch => {
        dispatch({
            type: LOANS_FETCH_ALL_REQUESTED
        });

        try {
            const allLoans = await fetchAllLoansTx();

            return dispatch({
                type: LOANS_FETCH_ALL_RECEIVED,
                result: allLoans
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: LOANS_FETCH_ALL_ERROR,
                error: error
            });
        }
    };
}

export function fetchLoansForAddress(userAccount) {
    return async dispatch => {
        dispatch({
            type: LOANS_LOANLIST_REQUESTED
        });

        try {
            const loans = await store.getState().web3Connect.augmint.getLoansForAccount(userAccount);

            return dispatch({
                type: LOANS_LOANLIST_RECEIVED,
                loans: loans
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: LOANS_LOANLIST_ERROR,
                error: error
            });
        }
    };
}
