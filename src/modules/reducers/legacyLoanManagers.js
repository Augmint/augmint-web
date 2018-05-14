import store from "modules/store";
import {
    fetchActiveLegacyLoansForAddressTx,
    repayLegacyLoanTx,
    collectLegacyLoansTx
} from "modules/ethereum/legacyLoanManagersTransactions";

const LEGACY_LOANMANAGERS_REFRESH_REQUESTED = "legacyLoanManagers/REFRESH_REQUESTED";
const LEGACY_LOANMANAGERS_REFRESH_ERROR = "legacyLoanManagers/REFRESH_ERROR";
const LEGACY_LOANMANAGERS_REFRESH_SUCCESS = "legacyLoanManagers/REFRESH_SUCCESS";

const LEGACY_LOANMANAGERS_DISMISS_REQUESTED = "legacyLoanManagers/DISMISS_REQUESTED";
const LEGACY_LOANMANAGERS_DISMISS_ERROR = "legacyLoanManagers/DISMISS_ERROR";
const LEGACY_LOANMANAGERS_DISMISS_SUCCESS = "legacyLoanManagers/DISMISS_SUCCESS";

const LEGACY_LOANMANAGERS_REPAY_REQUESTED = "legacyLoanManagers/REPAY_REQUESTED";
const LEGACY_LOANMANAGERS_REPAY_ERROR = "legacyLoanManagers/REPAY_ERROR";
export const LEGACY_LOANMANAGERS_REPAY_SUCCESS = "legacyLoanManagers/REPAY_SUCCESS";

const LEGACY_LOANMANAGERS_COLLECT_REQUESTED = "legacyLoanManagers/COLLECT_REQUESTED";
const LEGACY_LOANMANAGERS_COLLECT_ERROR = "legacyLoanManagers/COLLECT_ERROR";
export const LEGACY_LOANMANAGERS_COLLECT_SUCCESS = "legacyLoanManagers/REPAY_SUCCESS";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null,
    contracts: [],
    result: null,
    request: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LEGACY_LOANMANAGERS_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                loadError: null
            };

        case LEGACY_LOANMANAGERS_REFRESH_SUCCESS:
            return {
                ...state,
                contracts: action.result,
                isLoading: false,
                isLoaded: true,
                loadError: null
            };

        case LEGACY_LOANMANAGERS_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                refreshError: action.error
            };

        case LEGACY_LOANMANAGERS_REPAY_REQUESTED:
        case LEGACY_LOANMANAGERS_COLLECT_REQUESTED:
        case LEGACY_LOANMANAGERS_DISMISS_REQUESTED:
            return {
                ...state,
                request: action.request
            };

        case LEGACY_LOANMANAGERS_REPAY_SUCCESS:
            return {
                ...state,
                result: action.result,
                contracts: action.contracts,
                request: null
            };

        case LEGACY_LOANMANAGERS_COLLECT_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case LEGACY_LOANMANAGERS_COLLECT_ERROR:
        case LEGACY_LOANMANAGERS_REPAY_ERROR:
        case LEGACY_LOANMANAGERS_DISMISS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error,
                request: null
            };

        case LEGACY_LOANMANAGERS_DISMISS_SUCCESS:
            return {
                ...state,
                contracts: action.result,
                request: null
            };

        default:
            return state;
    }
};

export const refreshLegacyLoanManagers = () => {
    return async dispatch => {
        dispatch({
            type: LEGACY_LOANMANAGERS_REFRESH_REQUESTED
        });
        try {
            const userAccount = store.getState().web3Connect.userAccount;
            const contracts = await fetchActiveLegacyLoansForAddressTx(userAccount);

            return dispatch({
                type: LEGACY_LOANMANAGERS_REFRESH_SUCCESS,
                result: contracts
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_LOANMANAGERS_REFRESH_ERROR,
                error: error
            });
        }
    };
};

export function dismissLegacyLoanManager(legacyLoanManagerAddress) {
    return async dispatch => {
        dispatch({
            type: LEGACY_LOANMANAGERS_DISMISS_REQUESTED,
            request: { legacyLockerAddress: legacyLoanManagerAddress }
        });
        try {
            const contracts = [...store.getState().legacyLoanManagers.contracts];

            const index = contracts.findIndex(item => item.address === legacyLoanManagerAddress);
            contracts[index].isDismissed = true;

            return dispatch({
                type: LEGACY_LOANMANAGERS_DISMISS_SUCCESS,
                result: contracts
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_LOANMANAGERS_DISMISS_ERROR,
                error: error
            });
        }
    };
}

export function repayLegacyLoan(legacyLoanManagerAddress, repaymentAmount, loanId) {
    return async dispatch => {
        dispatch({
            type: LEGACY_LOANMANAGERS_REPAY_REQUESTED,
            request: { legacyLoanManagerAddress, repaymentAmount, loanId }
        });

        try {
            const contracts = [...store.getState().legacyLoanManagers.contracts];
            const result = await repayLegacyLoanTx(legacyLoanManagerAddress, repaymentAmount, loanId);

            const contractIndex = contracts.findIndex(contract => contract.address === legacyLoanManagerAddress);
            const loanIndex = contracts[contractIndex].loans.findIndex(loan => loan.id === loanId);

            contracts[contractIndex].loans[loanIndex].isSubmitted = true;

            return dispatch({
                type: LEGACY_LOANMANAGERS_REPAY_SUCCESS,
                result,
                contracts
            });
        } catch (error) {
            return dispatch({
                type: LEGACY_LOANMANAGERS_REPAY_ERROR,
                error: error
            });
        }
    };
}

export function collectLegacyLoans(legacyLoanManagerAddress, loansToCollect) {
    return async dispatch => {
        dispatch({
            type: LEGACY_LOANMANAGERS_COLLECT_REQUESTED,
            request: { legacyLoanManagerAddress, loansToCollect }
        });

        try {
            const contracts = [...store.getState().legacyLoanManagers.contracts];
            const result = await collectLegacyLoansTx(legacyLoanManagerAddress, loansToCollect);

            const contractIndex = contracts.findIndex(contract => contract.address === legacyLoanManagerAddress);
            for (let i = 0; i < loansToCollect.length; i++) {
                const loanIndex = contracts[contractIndex].loans.findIndex(loan => loan.id === loansToCollect[i].id);

                contracts[contractIndex].loans[loanIndex].isSubmitted = true;
            }

            return dispatch({
                type: LEGACY_LOANMANAGERS_COLLECT_SUCCESS,
                result,
                contracts
            });
        } catch (error) {
            return dispatch({
                type: LEGACY_LOANMANAGERS_COLLECT_ERROR,
                error: error
            });
        }
    };
}
