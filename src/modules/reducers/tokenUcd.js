/*
    TODO: separate trasnfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import tokenUcd_artifacts from "contractsBuild/TokenAcd.json";
import BigNumber from "bignumber.js";
import { asyncGetBalance, getUcdBalance } from "modules/ethereum/ethHelper";
import { transferUcdTx } from "modules/ethereum/transferTransactions";

export const TOKENUCD_CONNECT_REQUESTED = "tokenUcd/TOKENUCD_CONNECT_REQUESTED";
export const TOKENUCD_CONNECT_SUCCESS = "tokenUcd/TOKENUCD_CONNECT_SUCCESS";
export const TOKENUCD_CONNECT_ERROR = "tokenUcd/TOKENUCD_CONNECT_ERROR";

export const TOKENUCD_REFRESH_REQUESTED = "tokenUcd/TOKENUCD_REFRESH_REQUESTED";
export const TOKENUCD_REFRESHED = "tokenUcd/TOKENUCD_REFRESHED";

export const TOKENUCD_TRANSFER_REQUESTED = "tokenUcd/TOKENUCD_TRANSFER_REQUESTED";
export const TOKENUCD_TRANSFER_SUCCESS = "tokenUcd/TOKENUCD_TRANSFER_SUCCESS";
export const TOKENUCD_TRANSFER_ERROR = "tokenUcd/TOKENUCD_TRANSFER_ERROR";

const initialState = {
    contract: null,
    isLoading: false,
    isConnected: false,
    error: null,
    connectionError: null,
    info: {
        owner: "?",
        ethBalance: "?",
        bn_ethBalance: null,
        ethPendingBalance: "?",
        decimals: "?",
        decimalsDiv: "?",
        bn_decimalsDiv: null,
        ucdBalance: "?",
        feeAccountAcdBalance: "?",
        interestPoolAccountAcdBalance: "?",
        interestEarnedAccountAcdBalance: "?",
        ucdPendingBalance: "?",
        totalSupply: "?"
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
                    store.getState().web3Connect.web3Instance,
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
        let bn_decimals = await tokenUcd.decimals();
        let bn_decimalsDiv = new BigNumber(10).pow(bn_decimals);
        let feeAccount = await tokenUcd.feeAccount();
        let interestPoolAccount = await tokenUcd.interestPoolAccount();
        let interestEarnedAccount = await tokenUcd.interestEarnedAccount();
        let bn_feeAccountAcdBalance = await getUcdBalance(feeAccount);
        let bn_interestPoolAccountAcdBalance = await getUcdBalance(interestPoolAccount);
        let bn_interestEarnedAccountAcdBalance = await getUcdBalance(interestEarnedAccount);

        let bn_ethBalance = await asyncGetBalance(tokenUcd.address);
        let bn_ethPendingBalance = await asyncGetBalance(tokenUcd.address, "pending");
        let bn_ucdBalance = await getUcdBalance(tokenUcd.address);
        let bn_ucdPendingBalance = await getUcdBalance(tokenUcd.address, "pending");

        return dispatch({
            type: TOKENUCD_REFRESHED,
            result: {
                owner: owner,
                decimals: bn_decimals.toNumber(),
                bn_decimalsDiv: bn_decimalsDiv,
                decimalsDiv: bn_decimalsDiv.toNumber(),
                ucdBalance: bn_ucdBalance.toNumber(),
                bn_feeAccountAcdBalance: bn_feeAccountAcdBalance,
                feeAccountAcdBalance: bn_feeAccountAcdBalance.toString(),
                bn_interestPoolAccountAcdBalance: bn_interestPoolAccountAcdBalance,
                interestPoolAccountAcdBalance: bn_interestPoolAccountAcdBalance.toString(),
                bn_interestEarnedAccountAcdBalance: bn_interestEarnedAccountAcdBalance,
                interestEarnedAccountAcdBalance: bn_interestEarnedAccountAcdBalance.toString(),
                ucdPendingBalance: bn_ucdPendingBalance.toNumber(),
                ethBalance: bn_ethBalance.toNumber(),
                bn_ethBalance: bn_ethBalance,
                bn_ethPendingBalance: bn_ethPendingBalance,
                ethPendingBalance: bn_ethPendingBalance.toNumber(),
                totalSupply: bn_totalSupply.div(bn_decimalsDiv).toNumber(),
                feeAccount: feeAccount,
                feePt: await tokenUcd.transferFeePt(),
                feeMin: await tokenUcd.transferFeeMin(),
                feeMax: await tokenUcd.transferFeeMax()
            }
        });
    };
};

export function transferUcd(payload) {
    return async dispatch => {
        dispatch({
            type: TOKENUCD_TRANSFER_REQUESTED,
            ucdcAmount: payload.ucdcAmount,
            payee: payload.payee
        });

        try {
            let result = await transferUcdTx(payload);
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
