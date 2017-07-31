import { default as Web3} from 'web3';
export const WEB3_SETUP_REQUESTED = 'ethBase/WEB3_SETUP_REQUESTED'
export const WEB3_SETUP= 'ethBase/WEB3_SETUP'
export const BALANCE_REFRESH_REQUESTED = 'ethBase/BALANCE_REFRESH_REQUESTED'
export const BALANCE_REFRESHED = 'ethBase/BALANCE_REFRESHED'

const initialState = {
    web3Instance: null,
    web3ConnectionId: null, // workaround so that we don't need deep compare web3Instance to detecet change
    userAccount: '0x0',
    accounts: [],
    balance: '?',
    isLoading: false,
    isConnected: false
}

var web3;

export default (state = initialState, action) => {
    switch (action.type) {
        case WEB3_SETUP_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case WEB3_SETUP:
        return {
            ...state,
            isLoading: false,
            isConnected: true,
            web3ConnectionId: state.web3ConnectionId + 1,
            userAccount: action.accounts[0],
            accounts: action.accounts,
            web3Instance: action.web3Instance
        }

        case BALANCE_REFRESH_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case BALANCE_REFRESHED:
        return {
            ...state,
            balance: action.balance,
            isLoading: false
        }

        default:
            return state
    }
}

export const setupWeb3 = () => {
    return dispatch => {
        dispatch({
            type: WEB3_SETUP_REQUESTED
        })

        if (typeof web3 !== 'undefined') {
            web3 = new Web3(web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        return web3.eth.getAccounts( (error, accounts) => {
            if (error) { // TODO: proper error handling
                throw error;
            }
            // TODO: could we use web3.eth.defaultAccount?
            dispatch({
                type: WEB3_SETUP,
                web3Instance: web3,  // Object.assign({}, web3),
                userAccount: accounts[0],
                accounts: accounts
            })
        });
    }
}


export function refreshBalance(address) {
    return dispatch => {
        dispatch({
            type: BALANCE_REFRESH_REQUESTED,
            address: address
        })

        // TODO: change this to a balance 'cache' of all balances

        return web3.eth.getBalance(address, function(error, bal) {
                dispatch({
                    type: BALANCE_REFRESHED,
                    balance: web3.fromWei(bal).toNumber()
                })
        });
    }
}
