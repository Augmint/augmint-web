/* ETH and UCD balance for the active userAccount
    TODO: make this generic? ie. to use this for any address balances?
    TODO: refresh balances on certain events (all balances on new block? or try to be smart?)
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import { asyncGetBalance, getUcdBalance } from './ethHelper'

export const BALANCE_REQUESTED = 'balances/BALANCE_REQUESTED'
export const BALANCE_RECEIVED  = 'balances/BALANCE_RECEIVED'

const initialState = {
    account: {
            address: '?',
            ethBalance: '?',
            ucdBalance: '?'
    }
}

export default (state = initialState, action) => {
    switch (action.type) {
        case BALANCE_REQUESTED:
        return state;

        case BALANCE_RECEIVED:
        return {
            ...state,
            account: action.account
        }

        default:
        return state;
    }
}

export function getBalance(address) {
    return async dispatch => {

        dispatch({
            type: BALANCE_REQUESTED
        })

        let ucdBalance = await getUcdBalance(address);
        let ethBalance = await asyncGetBalance(address);
        return dispatch({
                type: BALANCE_RECEIVED,
                account: {
                    address: address,
                    ethBalance: ethBalance,
                    ucdBalance: ucdBalance
                }
        });
    }
}
