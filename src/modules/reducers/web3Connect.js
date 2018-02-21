import { default as Web3 } from "web3";
import { getNetworkDetails } from "modules/ethereum/ethHelper";
import ethers from "ethers";

export const WEB3_SETUP_REQUESTED = "WEB3_SETUP_REQUESTED";
export const WEB3_SETUP_SUCCESS = "WEB3_SETUP_SUCCESS";
export const WEB3_SETUP_ERROR = "WEB3_SETUP_ERROR";
export const WEB3_ACCOUNT_CHANGE = "WEB3_ACCOUNT_CHANGE";

const initialState = {
    error: null,
    web3Instance: null,
    info: { web3Version: "?" },
    userAccount: "?",
    accounts: null,
    isLoading: false,
    isConnected: false,
    network: { id: "?", name: "?" },
    ethers: { provider: null, signer: null }
};

var web3;

export default (state = initialState, action) => {
    switch (action.type) {
        case WEB3_SETUP_REQUESTED:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case WEB3_SETUP_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isConnected: true,
                error: null,
                userAccount: action.accounts[0],
                accounts: action.accounts,
                web3Instance: action.web3Instance,
                network: action.network,
                info: action.info,
                ethers: action.ethers
            };

        case WEB3_SETUP_ERROR:
            return {
                ...state,
                isLoading: false,
                isConnected: false,
                error: action.error
            };

        case WEB3_ACCOUNT_CHANGE:
            return {
                ...state,
                accounts: action.accounts,
                userAccount: action.userAccount
            };

        default:
            return state;
    }
};

export const setupWeb3 = () => {
    return async dispatch => {
        dispatch({
            type: WEB3_SETUP_REQUESTED
        });

        try {
            let provider, signer;
            if (typeof window.web3 !== "undefined") {
                console.debug("Using web3 detected from external source.");
                web3 = new Web3(window.web3.currentProvider);

                // Ethers: Use Mist/MetaMask's provider
                provider = new ethers.providers.Web3Provider(web3.currentProvider);
                signer = provider.getSigner();
            } else {
                //throw new Error("No web3 detected.");
                //set the provider you want from Web3.providers
                console.debug(
                    "No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask"
                );
                //const web3Provider = new Web3.providers.WebsocketProvider("ws://localhost:8545");
                web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

                // Ethers: Allow read-only access to the blockchain if no Mist/Metamask/EthersWallet
                //provider = ethers.providers.getDefaultProvider();
                // TODO: https://github.com/ethers-io/ethers.js/issues/108
                provider = new ethers.providers.JsonRpcProvider("http://localhost:8545", {
                    name: "testRpc",
                    chainId: 999
                });
                signer = null;

            //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
            if (typeof web3.currentProvider.sendAsync !== "function") {
                web3.currentProvider.sendAsync = function() {
                    return web3.currentProvider.send.apply(web3.currentProvider, arguments);
                };
            }

            const [lastBlock, network, accounts] = await Promise.all([
                web3.eth.getBlock("latest"),
                getNetworkDetails(web3),
                web3.eth.getAccounts()
            ]);

            const web3Version = web3.version.api ? web3.version.api : web3.version; // web3 0.x: web3.version.api, 1.0.0: web3.version

            dispatch({
                type: WEB3_SETUP_SUCCESS,
                web3Instance: web3,
                userAccount: accounts[0], // TODO: could we use web3.eth.defaultAccount?
                accounts,
                network,
                ethers: { signer: signer, provider: provider },
                info: { web3Version: web3Version, gasLimit: lastBlock.gasLimit }
            });
        } catch (error) {
            return dispatch({
                type: WEB3_SETUP_ERROR,
                error: error
            });
        }
    };
};

export const accountChange = newAccounts => {
    return {
        type: WEB3_ACCOUNT_CHANGE,
        userAccount: newAccounts[0],
        accounts: newAccounts
    };
};
