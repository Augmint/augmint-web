/* Loans for one account
    TODO: consider selectors https://github.com/reactjs/reselect */
import store from "modules/store";
import { fetchLoansForAddressTx } from "modules/ethereum/loanTransactions";

export const LOANS_LOANLIST_REQUESTED = "loans/LOANS_LOANLIST_REQUESTED";
export const LOANS_LOANLIST_RECEIVED = "loans/LOANS_LOANLIST_RECEIVED";
export const LOANS_LOANLIST_ERROR = "loans/LOANS_LOANLIST_ERROR";

const initialState = {
    loans: null,
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

export function fetchLoansForAddress(userAccount) {
    return async dispatch => {
        dispatch({
            type: LOANS_LOANLIST_REQUESTED
        });

        try {
            const loanManagerInstance = store.getState().contracts.latest.loanManager.web3ContractInstance;
            const loans = await fetchLoansForAddressTx(loanManagerInstance, userAccount);

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
