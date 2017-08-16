/* ETH and UCD balance for the active userAccount
    TODO: add all user accounts?
    TODO: make this generic? ie. to use this for any address balances?
    TODO: refresh balances on certain events (all balances on new block? or try to be smart?)
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import { asyncGetBalance, getUcdBalance } from "./ethHelper";

export const USER_BALANCE_REQUESTED = "userBalances/BALANCE_REQUESTED";
export const USER_BALANCE_RECEIVED = "userBalances/BALANCE_RECEIVED";
export const USER_TRANSACTIONLIST_REQUESTED =
    "userBalances/USER_TRANSACTIONLIST_REQUESTED";
export const USER_TRANSACTIONLIST_ERROR =
    "userBalances/USER_TRANSACTIONLIST_ERROR";
export const USER_TRANSACTIONLIST_RECEIVED =
    "userBalances/USER_TRANSACTIONLIST_RECEIVED";

const initialState = {
    isLoading: true,
    account: {
        address: "?",
        ethBalance: "?",
        ucdBalance: "?"
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

        let bn_ucdBalance = await getUcdBalance(address);
        let bn_ethBalance = await asyncGetBalance(address);
        return dispatch({
            type: USER_BALANCE_RECEIVED,
            account: {
                address: address,
                bn_ethBalance: bn_ethBalance,
                ethBalance: bn_ethBalance.toNumber(),
                bn_ucdBalance: bn_ucdBalance,
                ucdBalance: bn_ucdBalance.toNumber()
            }
        });
    };
}
