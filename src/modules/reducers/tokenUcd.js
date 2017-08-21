/*
    TODO: separate trasnfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import tokenUcd_artifacts from "contractsBuild/TokenUcd.json";
import BigNumber from "bignumber.js";
import { asyncGetBalance, getUcdBalance } from "modules/ethereum/ethHelper";
import { transferUcdTx } from "modules/ethereum/transferTransactions";

export const TOKENUCD_CONNECT_REQUESTED = "tokenUcd/TOKENUCD_CONNECT_REQUESTED";
export const TOKENUCD_CONNECT_SUCCESS = "tokenUcd/TOKENUCD_CONNECT_SUCESS";
export const TOKENUCD_CONNECT_ERROR = "tokenUcd/TOKENUCD_CONNECT_ERROR";

export const TOKENUCD_REFRESH_REQUESTED = "tokenUcd/TOKENUCD_REFRESH_REQUESTED";
export const TOKENUCD_REFRESHED = "tokenUcd/TOKENUCD_REFRESHED";

export const TOKENUCD_TRANSFER_REQUESTED =
    "tokenUcd/TOKENUCD_TRANSFER_REQUESTED";
export const TOKENUCD_TRANSFER_SUCCESS = "tokenUcd/TOKENUCD_TRANSFER_SUCCESS";
export const TOKENUCD_TRANSFER_ERROR = "tokenUcd/TOKENUCD_TRANSFER_ERROR";

const initialState = {
    contract: null,
    isLoading: true,
    isConnected: false,
    error: null,
    connectionError: null,
    info: {
        owner: "?",
        ethBalance: "?",
        bn_ethBalance: null,
        decimals: "?",
        decimalsDiv: "?",
        bn_decimalsDiv: null,
        ucdBalance: "?",
        totalSupply: "?",
        loanManagerAddress: "?"
    }
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
                info: action.result
            };

        case TOKENUCD_TRANSFER_REQUESTED:
            return {
                ...state,
                error: null,
                ucdAmount: action.ucdAmount,
                payee: action.payee
            };

        case TOKENUCD_TRANSFER_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case TOKENUCD_TRANSFER_ERROR:
            return {
                ...state,
                error: action.error
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
                    store.getState().web3Connect.web3Instance.currentProvider,
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
        let bn_totalSupply = await tokenUcd.totalSupply();
        let loanManagerAddress = await tokenUcd.loanManagerAddress();
        let bn_decimals = await tokenUcd.decimals();
        let bn_decimalsDiv = new BigNumber(10).pow(bn_decimals);
        let bn_ethBalance = await asyncGetBalance(tokenUcd.address);
        let bn_ucdBalance = await getUcdBalance(tokenUcd.address);

        return dispatch({
            type: TOKENUCD_REFRESHED,
            result: {
                owner: owner,
                decimals: bn_decimals.toNumber(),
                bn_decimalsDiv: bn_decimalsDiv,
                decimalsDiv: bn_decimalsDiv.toNumber(),
                ucdBalance: bn_ucdBalance.toNumber(),
                ethBalance: bn_ethBalance.toNumber(),
                bn_ethBalance: bn_ethBalance,
                totalSupply: bn_totalSupply.div(bn_decimalsDiv).toNumber(),
                loanManagerAddress: loanManagerAddress
            }
        });
    };
};

export function transferUcd(payee, ucdAmount) {
    return async dispatch => {
        dispatch({
            type: TOKENUCD_TRANSFER_REQUESTED,
            ucdAmount: ucdAmount,
            payee: payee
        });

        try {
            let result = await transferUcdTx(payee, ucdAmount);
            return dispatch({
                type: TOKENUCD_TRANSFER_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: TOKENUCD_TRANSFER_ERROR,
                error: error
            });
        }
    };
}
