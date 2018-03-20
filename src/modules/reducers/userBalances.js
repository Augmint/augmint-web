/*
ETH and A-EUR balance for the active userAccount
    TODO: add all user accounts?
    TODO: make this generic? ie. to use this for any address balances?
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import store from "modules/store";

import { ONE_ETH_IN_WEI } from "utils/constants";

export const USER_BALANCE_REQUESTED = "userBalances/BALANCE_REQUESTED";
export const USER_BALANCE_RECEIVED = "userBalances/BALANCE_RECEIVED";
export const USER_BALANCE_ERROR = "userBalances/BALANCE_ERROR";

const initialState = {
    isLoading: false,
    error: null,
    account: {
        address: "?",

        ethBalance: "?",
        bn_ethBalance: null,

        tokenBalance: "?",
        bn_tokenBalance: null
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
        case USER_BALANCE_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
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

        try {
            const web3 = store.getState().web3Connect.web3Instance;
            const augmintToken = store.getState().augmintToken.contract.instance;
            const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

            const [bn_tokenBalance, bn_ethBalance] = await Promise.all([
                augmintToken.balanceOf(address),
                web3.eth.getBalance(address)
            ]);

            return dispatch({
                type: USER_BALANCE_RECEIVED,
                account: {
                    address,
                    bn_ethBalance,
                    ethBalance: bn_ethBalance / ONE_ETH_IN_WEI,
                    bn_tokenBalance,
                    tokenBalance: bn_tokenBalance / decimalsDiv
                }
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                throw new Error(error);
            }
            return dispatch({
                type: USER_BALANCE_ERROR,
                error: error
            });
        }
    };
}
