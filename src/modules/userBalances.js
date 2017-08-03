/* ETH and UCD balance for the active userAccount
    TODO: add all user accounts?
    TODO: make this generic? ie. to use this for any address balances?
    TODO: refresh balances on certain events (all balances on new block? or try to be smart?)
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import { asyncGetBalance, getUcdBalance } from './ethHelper'

export const USER_BALANCE_REQUESTED = 'userBalances/BALANCE_REQUESTED'
export const USER_BALANCE_RECEIVED  = 'userBalances/BALANCE_RECEIVED'

const initialState = {
    account: {
            address: '?',
            ethBalance: '?',
            ucdBalance: '?'
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case USER_BALANCE_REQUESTED:
        return state;

        case USER_BALANCE_RECEIVED:
        return {
            ...state,
            account: action.account
        }

        default:
        return state;
    }
}

export function fetchUserBalance(address) {
    return async dispatch => {

        dispatch({
            type: USER_BALANCE_REQUESTED
        })

        let ucdBalance = await getUcdBalance(address);
        let ethBalance = await asyncGetBalance(address);
        return dispatch({
                type: USER_BALANCE_RECEIVED,
                account: {
                    address: address,
                    ethBalance: ethBalance,
                    ucdBalance: ucdBalance
                }
        });
    }
}
