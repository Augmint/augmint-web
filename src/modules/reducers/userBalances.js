/*
ETH and A-EUR balance for the active userAccount
    TODO: add all user accounts?
    TODO: make this generic? ie. to use this for any address balances?
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import store from "modules/store";
import { asyncGetBalance } from "modules/ethereum/ethHelper";

export const USER_BALANCE_REQUESTED = "userBalances/BALANCE_REQUESTED";
export const USER_BALANCE_RECEIVED = "userBalances/BALANCE_RECEIVED";
export const USER_TRANSACTIONLIST_REQUESTED = "userBalances/USER_TRANSACTIONLIST_REQUESTED";
export const USER_TRANSACTIONLIST_ERROR = "userBalances/USER_TRANSACTIONLIST_ERROR";
export const USER_TRANSACTIONLIST_RECEIVED = "userBalances/USER_TRANSACTIONLIST_RECEIVED";

const initialState = {
    isLoading: false,
    account: {
        address: "?",
        ethBalance: "?",
        bn_ethBalance: null,
        ethPendingBalance: "?",
        bn_ethPendingBalance: null,
        tokenBalance: "?",
        bn_tokenBalance: null,
        pendingTokenBalance: "?",
        bn_pendingTokenBalance: null
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case USER_BALANCE_REQUESTED:
            return {
                ...state,
                isLoading: true,
                address: action.address
            };

        case USER_BALANCE_RECEIVED:
            return {
                ...state,
                isLoading: false,
                account: action.account
            };

        default:
            return state;
    }
};

export function fetchUserBalance(address) {
    return async dispatch => {
        dispatch({
            type: USER_BALANCE_REQUESTED,
            address: address
        });

        const augmintToken = store.getState().augmintToken.contract.instance;

        const [bn_tokenBalance, bn_pendingTokenBalance, bn_ethBalance, bn_ethPendingBalance] = await Promise.all([
            augmintToken.balanceOf(address),
            augmintToken.balanceOf(address, { defaultBlock: "pending" }),
            asyncGetBalance(address),
            asyncGetBalance(address, "pending")
        ]);

        return dispatch({
            type: USER_BALANCE_RECEIVED,
            account: {
                address: address,
                bn_ethBalance: bn_ethBalance,
                ethBalance: bn_ethBalance.toString(),
                bn_ethPendingBalance: bn_ethPendingBalance.sub(bn_ethBalance),
                ethPendingBalance: bn_ethPendingBalance.sub(bn_ethBalance).toNumber(),
                bn_tokenBalance: bn_tokenBalance.div(10000),
                tokenBalance: bn_tokenBalance.div(10000).toString(),
                bn_pendingTokenBalance: bn_pendingTokenBalance.sub(bn_tokenBalance).div(10000),
                pendingTokenBalance: bn_pendingTokenBalance.sub(bn_tokenBalance).toNumber()
            }
        });
    };
}
