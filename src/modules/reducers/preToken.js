import store from "modules/store";
import { fetchTransfersForAccountTx, fetchAccountInfoTx } from "modules/ethereum/preTokenTransactions";

export const PRETOKEN_REFRESH_REQUESTED = "preToken/REFRESH_REQUESTED";
export const PRETOKEN_REFRESH_ERROR = "preToken/REFRESH_ERROR";
export const PRETOKEN_REFRESH_DONE = "preToken/REFRESH_DONE";

export const FETCH_TRANSFERS_REQUESTED = "preToken/FETCH_TRANSFERS_REQUESTED";
export const FETCH_TRANSFERS_ERROR = "preToken/FETCH_TRANSFERS_ERROR";
export const FETCH_TRANSFERS_DONE = "preToken/FETCH_TRANSFERS_DONE";

// export const FETCH_AGREEMENTS_REQUESTED = "preToken/FETCH_AGREEMENTS_REQUESTED";
// export const FETCH_AGREEMENTS_ERROR = "preToken/FETCH_AGREEMENTS_ERROR";
// export const FETCH_AGREEMENTS_DONE = "preToken/PROCESS_NEW_LOCK_DONE";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null,
    info: {
        name: "?",
        symbol: "?",
        decimals: "?",
        totalSupply: "?",
        agreementsCount: "?",
        userAccount: "?"
    },
    accountInfo: { userAccount: "?", balance: "?", agreementHash: "?", valuationCap: "?", discount: "?" },
    transfers: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case PRETOKEN_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case PRETOKEN_REFRESH_DONE:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                info: action.info
            };

        case PRETOKEN_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                loadError: action.error
            };

        case FETCH_TRANSFERS_REQUESTED:
            return {
                ...state,
                account: action.account,
                isLoading: true
            };

        case FETCH_TRANSFERS_DONE:
            return {
                ...state,
                isLoading: false,
                transfers: action.result.transfers,
                accountInfo: action.result.accountInfo
            };

        case FETCH_TRANSFERS_ERROR:
            //    case FETCH_AGREEMENTS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export function refreshPreToken() {
    return async dispatch => {
        dispatch({
            type: PRETOKEN_REFRESH_REQUESTED
        });
        try {
            const preTokenInstance = store.getState().contracts.latest.preToken.web3ContractInstance;
            const [name, symbol, decimals, totalSupply, agreementsCount] = await Promise.all([
                preTokenInstance.methods.name().call(),
                preTokenInstance.methods.symbol().call(),
                preTokenInstance.methods.decimals().call(),
                preTokenInstance.methods.totalSupply().call(),
                preTokenInstance.methods.getAgreementsCount().call()
            ]);
            const info = {
                name,
                symbol,
                decimals: parseInt(decimals, 10),
                totalSupply: parseInt(totalSupply, 10),
                agreementsCount: parseInt(agreementsCount, 10)
            };
            return dispatch({
                type: PRETOKEN_REFRESH_DONE,
                info
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: PRETOKEN_REFRESH_ERROR,
                error: error
            });
        }
    };
}

export function fetchTransfersForAccount(userAccount) {
    return async dispatch => {
        dispatch({ type: FETCH_TRANSFERS_REQUESTED, userAccount });
        try {
            const [transfers, accountInfo] = await Promise.all([
                fetchTransfersForAccountTx(userAccount),
                fetchAccountInfoTx(userAccount)
            ]);

            transfers.sort((a, b) => {
                return b.blockNumber > a.blockNumber;
            });

            return dispatch({
                type: FETCH_TRANSFERS_DONE,
                result: {
                    transfers,
                    accountInfo
                }
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: FETCH_TRANSFERS_ERROR,
                error: error
            });
        }
    };
}
