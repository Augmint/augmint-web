import store from "modules/store";

import { repayLoanTx, newEthBackedLoanTx, collectLoansTx } from "modules/ethereum/loanTransactions";

export const LOANTRANSACTIONS_NEWLOAN_REQUESTED = "loanTransactions/LOANTRANSACTIONS_NEWLOAN_REQUESTED";
export const LOANTRANSACTIONS_NEWLOAN_CREATED = "loanTransactions/LOANTRANSACTIONS_NEWLOAN_CREATED";
export const LOANTRANSACTIONS_NEWLOAN_ERROR = "loanTransactions/LOANTRANSACTIONS_NEWLOAN_ERROR";

export const LOANTRANSACTIONS_REPAY_REQUESTED = "loanTransactions/LOANTRANSACTIONS_REPAY_REQUESTED";
export const LOANTRANSACTIONS_REPAY_SUCCESS = "loanTransactions/LOANTRANSACTIONS_REPAY_SUCCESS";
export const LOANTRANSACTIONS_REPAY_ERROR = "loanTransactions/LOANTRANSACTIONS_REPAY_ERROR";

export const LOANTRANSACTIONS_COLLECT_REQUESTED = "loanTransactions/LOANTRANSACTIONS_COLLECT_REQUESTED";
export const LOANTRANSACTIONS_COLLECT_SUCCESS = "loanTransactions/LOANTRANSACTIONS_COLLECT_SUCCESS";
export const LOANTRANSACTIONS_COLLECT_ERROR = "loanTransactions/LOANTRANSACTIONS_COLLECT_ERROR";

const initialState = {
    result: null,
    error: null,
    loansToCollect: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANTRANSACTIONS_NEWLOAN_REQUESTED:
            return {
                ...state,
                error: null,
                result: null,
                ethAmount: action.ethAmount,
                product: action.product,
                address: action.address
            };

        case LOANTRANSACTIONS_NEWLOAN_CREATED:
            return {
                ...state,
                result: action.result
            };

        case LOANTRANSACTIONS_REPAY_REQUESTED:
            return {
                ...state,
                request: action.request,
                error: null,
                result: null
            };

        case LOANTRANSACTIONS_REPAY_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case LOANTRANSACTIONS_COLLECT_REQUESTED:
            return {
                ...state,
                loansToCollect: action.loansToCollect,
                isLoading: false,
                error: null,
                result: null
            };

        case LOANTRANSACTIONS_COLLECT_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case LOANTRANSACTIONS_NEWLOAN_ERROR:
        case LOANTRANSACTIONS_REPAY_ERROR:
        case LOANTRANSACTIONS_COLLECT_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export function newLoan(product, ethAmount, address) {
    return async dispatch => {
        dispatch({
            type: LOANTRANSACTIONS_NEWLOAN_REQUESTED,
            ethAmount: ethAmount,
            product: product,
            address: address
        });

        try {
            const result = await newEthBackedLoanTx(product, ethAmount, address);
            return dispatch({
                type: LOANTRANSACTIONS_NEWLOAN_CREATED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANTRANSACTIONS_NEWLOAN_ERROR,
                error: error
            });
        }
    };
}

export function repayLoan(repaymentAmount, loan, account) {
    return async dispatch => {
        dispatch({
            type: LOANTRANSACTIONS_REPAY_REQUESTED,
            request: { loan, repaymentAmount }
        });

        try {
            const result = await store.getState().web3Connect.augmint.repayLoan(loan, repaymentAmount, account);
            return dispatch({
                type: LOANTRANSACTIONS_REPAY_SUCCESS,
                result: result
            });
        } catch (error) {
            console.log(error);

            return dispatch({
                type: LOANTRANSACTIONS_REPAY_ERROR,
                error: error
            });
        }
    };
}

export function collectLoans(loansToCollect) {
    return async dispatch => {
        dispatch({
            type: LOANTRANSACTIONS_COLLECT_REQUESTED,
            loansToCollect: loansToCollect
        });

        try {
            const loanManagerInstance = store.getState().contracts.latest.loanManager.web3ContractInstance;
            const result = await collectLoansTx(loanManagerInstance, loansToCollect);
            return dispatch({
                type: LOANTRANSACTIONS_COLLECT_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANTRANSACTIONS_COLLECT_ERROR,
                error: error
            });
        }
    };
}
