/* ETH and UCD balance
    TODO: refresh balances on certain events (all balances on new block? or try to be smart?)
    TODO: do some balance caching. consider selectors for it: https://github.com/reactjs/reselect
*/
import store from './../store'
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

        let ucdBalance = '?';

        if (store.getState().tokenUcd.contract != null ) {
            console.log("getBalance tokenUcd exists")
            let tokenUcd = store.getState().tokenUcd.contract.instance;
            ucdBalance = (await tokenUcd.balanceOf(address)).toNumber() / 10000 // TODO: use store.getState().tokenUcd.decimalsDiv (timing issues);
        }
        let web3 = store.getState().ethBase.web3Instance;
        return web3.eth.getBalance(address, function(error, bal) {
            dispatch({
                type: BALANCE_RECEIVED,
                account: {
                    address: address,
                    ethBalance: web3.fromWei(bal).toNumber(),
                    ucdBalance: ucdBalance
                }
            })
        });
    }
}
