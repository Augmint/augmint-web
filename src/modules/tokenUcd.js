import store from "store.js";
import SolidityContract from "./SolidityContract";
import tokenUcd_artifacts from "contractsBuild/TokenUcd.json";
import { asyncGetBalance, getUcdBalance } from "./ethHelper";

export const TOKENUCD_CONNECT_REQUESTED = "tokenUcd/TOKENUCD_CONNECT_REQUESTED";
export const TOKENUCD_CONNECT_SUCCESS = "tokenUcd/TOKENUCD_CONNECT_SUCESS";
export const TOKENUCD_CONNECT_ERROR = "tokenUcd/TOKENUCD_CONNECT_ERROR";

export const TOKENUCD_REFRESH_REQUESTED = "tokenUcd/TOKENUCD_REFRESH_REQUESTED";
export const TOKENUCD_REFRESHED = "tokenUcd/TOKENUCD_REFRESHED";

const initialState = {
    contract: null,
    isLoading: true,
    isConnected: false,
    error: null,
    connectionError: null,
    owner: "?",
    ethBalance: "?",
    decimals: "?",
    decimalsDiv: "?",
    ucdBalance: "?",
    totalSupply: "?",
    loanManagerAddress: "?"
};

export default (state = initialState, action) => {
    switch (action.type) {
        case TOKENUCD_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                connectionError: null,
                error: null
            };

        case TOKENUCD_CONNECT_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isConnected: true,
                error: null,
                connectionError: null,
                contract: action.contract
            };

        case TOKENUCD_CONNECT_ERROR:
            return {
                ...state,
                isLoading: false,
                isConnected: false,
                connectionError: action.error
            };

        case TOKENUCD_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case TOKENUCD_REFRESHED:
            return {
                ...state,
                isLoading: false,
                owner: action.owner,
                decimals: action.decimals,
                decimalsDiv: action.decimalsDiv,
                ucdBalance: action.ucdBalance,
                ethBalance: action.ethBalance,
                totalSupply: action.totalSupply,
                loanManagerAddress: action.loanManagerAddress
            };

        default:
            return state;
    }
};

export const connectTokenUcd = () => {
    return async dispatch => {
        dispatch({
            type: TOKENUCD_CONNECT_REQUESTED
        });

        try {
            return dispatch({
                type: TOKENUCD_CONNECT_SUCCESS,
                contract: await SolidityContract.connectNew(
                    store.getState().ethBase.web3Instance.currentProvider,
                    tokenUcd_artifacts
                )
            });
        } catch (error) {
            return dispatch({
                type: TOKENUCD_CONNECT_ERROR,
                error: error
            });
        }
    };
};

export const refreshTokenUcd = () => {
    return async dispatch => {
        dispatch({
            type: TOKENUCD_REFRESH_REQUESTED
        });
        let tokenUcd = store.getState().tokenUcd.contract.instance;
        // TODO: make these paralel
        let owner = await tokenUcd.owner();
        let totalSupply = await tokenUcd.totalSupply();
        let loanManagerAddress = await tokenUcd.loanManagerAddress();
        let decimals = (await tokenUcd.decimals()).toNumber();
        let decimalsDiv = 10 ** decimals;
        let ethBalance = await asyncGetBalance(tokenUcd.address);
        let ucdBalance = await getUcdBalance(tokenUcd.address);

        return dispatch({
            type: TOKENUCD_REFRESHED,
            owner: owner,
            decimals: decimals,
            decimalsDiv: decimalsDiv,
            ucdBalance: ucdBalance,
            ethBalance: ethBalance,
            totalSupply: totalSupply.toNumber() / decimalsDiv,
            loanManagerAddress: loanManagerAddress
        });
    };
};
