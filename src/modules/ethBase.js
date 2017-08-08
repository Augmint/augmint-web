import { default as Web3} from 'web3';
import { asyncGetNetwork} from 'modules/ethHelper'

export const WEB3_SETUP_REQUESTED = 'ethBase/WEB3_SETUP_REQUESTED'
export const WEB3_SETUP= 'ethBase/WEB3_SETUP'

const initialState = {
    web3Instance: null,
    web3ConnectionId: null, // workaround so that we don't need deep compare web3Instance to detecet change
    userAccount: "?",
    accounts: null,
    isLoading: false, // TODO: isLoading & isConnected need to be refactored to work with other actions
    isConnected: false,
    network: { id: "?", name: "?" }
};

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
            web3Instance: action.web3Instance,
            network: action.network
        }

        default:
            return state
    }
}

export const setupWeb3 = () => {
    return async dispatch => {
        dispatch({
            type: WEB3_SETUP_REQUESTED
        })
        if (typeof window.web3 !== 'undefined') {
            console.debug("Using web3 detected from external source.");
            web3 = new Web3(window.web3.currentProvider);
        } else {
            // set the provider you want from Web3.providers
            console.debug("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
            web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
        }

        let network = await asyncGetNetwork(web3);
        return web3.eth.getAccounts( (error, accounts) => {
            if (error) { // TODO: proper error handling
                throw error;
            }
            // TODO: could we use web3.eth.defaultAccount?
            dispatch({
                type: WEB3_SETUP,
                web3Instance: web3,
                userAccount: accounts[0],
                accounts: accounts,
                network: network
            })
        });
    }
}
