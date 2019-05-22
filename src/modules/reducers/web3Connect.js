import store from "modules/store";
import { default as Web3 } from "web3";
import { ethers } from "ethers";
import { getNetworkDetails } from "modules/ethereum/ethHelper";
import { promiseTimeout } from "utils/helpers";
import { getCookie, setCookie } from "utils/cookie.js";
import { Augmint } from "@augmint/js";

export const WEB3_SETUP_REQUESTED = "WEB3_SETUP_REQUESTED";
export const WEB3_SETUP_SUCCESS = "WEB3_SETUP_SUCCESS";
export const WEB3_SETUP_ERROR = "WEB3_SETUP_ERROR";
export const WEB3_ACCOUNT_CHANGE = "WEB3_ACCOUNT_CHANGE";
export const WEB3_WATCH_ASSET_CHANGE = "WEB3_WATCH_ASSET_CHANGE";

const initialState = {
    error: null,
    web3Instance: null,
    info: { web3Version: "?" },
    userAccount: "?",
    accounts: null,
    isLoading: false,
    isConnected: false,
    ethers: { provider: null, signer: null },
    network: { id: "?", name: "?" },
    augmint: null,
    watchAsset: getCookie("watchAsset") || []
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
                augmint: action.augmint,
                userAccount: action.accounts[0],
                accounts: action.accounts,
                web3Instance: action.web3Instance,
                ethers: action.ethers,
                network: action.network,
                info: action.info
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
                userAccount: action.userAccount,
                ethers: action.ethers
            };

        case WEB3_WATCH_ASSET_CHANGE:
            return {
                ...state,
                watchAsset: action.watchAsset
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
            // Modern dapp browsers...
            if (window.ethereum) {
                web3 = new Web3(window.ethereum);
                await window.ethereum.enable();
            }
            // Legacy dapp browsers...
            else if (typeof window.web3 !== "undefined") {
                console.debug("Using web3 detected from external source.");
                web3 = new Web3(window.web3.currentProvider);
            } else {
                // Connection to locally running node for tests
                console.debug(
                    "No web3 detected. Falling back to http://localhost:8545. Don't use this for mainnet transactions (i.e. local geth etc.) becuase it's insecure."
                );
                web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:8545"));
            }

            //dirty hack for web3@1.0.0 support for localhost testrpc, see https://github.com/trufflesuite/truffle-contract/issues/56#issuecomment-331084530
            if (typeof web3.currentProvider.sendAsync !== "function") {
                web3.currentProvider.sendAsync = function() {
                    return web3.currentProvider.send.apply(web3.currentProvider, arguments);
                };
            }

            const [network, lastBlock, accounts] = await Promise.all([
                promiseTimeout(3000, getNetworkDetails(web3)),
                web3.eth.getBlock("latest"),
                web3.eth.getAccounts()
            ]);

            const userAccount = accounts[0];

            const web3Version = web3.version.api ? web3.version.api : web3.version;
            /************************************************************************************
             * Connect to Ethereum with augmint-js
             *   NB: transition to augmint-js in progress.
             *   It's a long journey but once done only EthereumConnection  connection will be required
             ************************************************************************************/
            const connectionConfig = {
                givenProvider: web3.currentProvider,
                // We assume that Metamask/Trustwallet/Metacoin wallet etc. injected provider takes care of reconnections
                ETHEREUM_CONNECTION_CHECK_INTERVAL: 0,
                ETHEREUM_CONNECTION_TIMEOUT: 20000

                // To access via Infura without Metamask (and don't pass givenProvider):
                // PROVIDER_URL: "wss://rinkeby.infura.io/ws/v3/", // or wss://rinkeby.infura.io/ws/v3/ or  ws://localhost:8545
                // PROVIDER_TYPE: "websocket",
                // INFURA_PROJECT_ID: "cb1b0d436be24b0fa654ca34ae6a3645" // this should come from env.local or hosting env setting
            };
            const augmint = await Augmint.create(connectionConfig);

            // ethers is used as a workaround for wallet providers are not suporting subscriptions via web3
            const ethersProvider = new ethers.providers.Web3Provider(web3.currentProvider);

            const ethersSigner = network.id === 999 ? null : ethersProvider.getSigner(); // only null signer works on local ganache

            const gasPrice = await web3.eth.getGasPrice();
            dispatch({
                type: WEB3_SETUP_SUCCESS,
                augmint,
                web3Instance: web3,
                userAccount,
                accounts,
                network,
                ethers: { signer: ethersSigner, provider: ethersProvider },
                info: { web3Version, gasLimit: lastBlock.gasLimit, gasPrice }
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
    const provider = store.getState().web3Connect.ethers.provider;
    const signer = provider.getSigner(newAccounts[0]);
    return {
        type: WEB3_ACCOUNT_CHANGE,
        userAccount: newAccounts[0],
        accounts: newAccounts,
        ethers: { signer, provider }
    };
};

export const watchAssetChange = value => {
    setCookie("watchAsset", value);
    return {
        type: WEB3_WATCH_ASSET_CHANGE,
        watchAsset: value
    };
};
