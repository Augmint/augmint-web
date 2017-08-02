import { default as Web3} from 'web3';
export const WEB3_SETUP_REQUESTED = 'ethBase/WEB3_SETUP_REQUESTED'
export const WEB3_SETUP= 'ethBase/WEB3_SETUP'

const initialState = {
    web3Instance: null,
    web3ConnectionId: null, // workaround so that we don't need deep compare web3Instance to detecet change
    userAccount: '0x0',
    accounts: [],
    isLoading: false,  // TODO: isLoading & isConnected need to be refactored to work with other actions
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
