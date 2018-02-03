/*
    TODO: separate transfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import augmintToken_artifacts from "contractsBuild/TokenAEur.json";
import BigNumber from "bignumber.js";
import { asyncGetBalance } from "modules/ethereum/ethHelper";
import { transferTokenTx } from "modules/ethereum/transferTransactions";

export const AUGMINT_TOKEN_CONNECT_REQUESTED = "augmintToken/AUGMINT_TOKEN_CONNECT_REQUESTED";
export const AUGMINT_TOKEN_CONNECT_SUCCESS = "augmintToken/AUGMINT_TOKEN_CONNECT_SUCCESS";
export const AUGMINT_TOKEN_CONNECT_ERROR = "augmintToken/AUGMINT_TOKEN_CONNECT_ERROR";

export const AUGMINT_TOKEN_REFRESH_REQUESTED = "augmintToken/AUGMINT_TOKEN_REFRESH_REQUESTED";
export const AUGMINT_TOKEN_REFRESHED = "augmintToken/AUGMINT_TOKEN_REFRESHED";

export const AUGMINT_TOKEN_TRANSFER_REQUESTED = "augmintToken/AUGMINT_TOKEN_TRANSFER_REQUESTED";
export const TOKEN_TRANSFER_SUCCESS = "augmintToken/TOKEN_TRANSFER_SUCCESS";
export const AUGMINT_TOKEN_TRANSFER_ERROR = "augmintToken/AUGMINT_TOKEN_TRANSFER_ERROR";

const initialState = {
    contract: null,
    isLoading: false,
    isConnected: false,
    error: null,
    connectionError: null,
    info: {
        peggedSymbol: "?",
        symbol: "?",
        ethBalance: "?",
        bn_ethBalance: null,
        ethPendingBalance: "?",
        decimals: "?",
        decimalsDiv: "?",
        bn_decimalsDiv: null,
        tokenBalance: "?",
        feeAccountAceBalance: "?",
        interestEarnedAccountAceBalance: "?",
        pendingTokenBalance: "?",
        totalSupply: "?",
        issuedByMonetaryBoard: "?"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case AUGMINT_TOKEN_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                connectionError: null,
                error: null
            };

        case AUGMINT_TOKEN_CONNECT_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isConnected: true,
                error: null,
                connectionError: null,
                contract: action.contract,
                info: action.info
            };

        case AUGMINT_TOKEN_CONNECT_ERROR:
            return {
                ...state,
                isLoading: false,
                isConnected: false,
                connectionError: action.error
            };

        case AUGMINT_TOKEN_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case AUGMINT_TOKEN_REFRESHED:
            return {
                ...state,
                isLoading: false,
                info: action.result
            };

        case AUGMINT_TOKEN_TRANSFER_REQUESTED:
            return {
                ...state,
                error: null,
                tokenAmount: action.tokenAmount,
                payee: action.payee
            };

        case TOKEN_TRANSFER_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case AUGMINT_TOKEN_TRANSFER_ERROR:
            return {
                ...state,
                error: action.error
            };

        default:
            return state;
    }
};

export const connectAugmintToken = () => {
    return async dispatch => {
        dispatch({
            type: AUGMINT_TOKEN_CONNECT_REQUESTED
        });

        try {
            const contract = await SolidityContract.connectNew(store.getState().web3Connect, augmintToken_artifacts);
            const info = await getAugmintTokenInfo(contract.instance);
            return dispatch({
                type: AUGMINT_TOKEN_CONNECT_SUCCESS,
                contract: contract,
                info: info
            });
        } catch (error) {
            return dispatch({
                type: AUGMINT_TOKEN_CONNECT_ERROR,
                error: error
            });
        }
    };
};

export const refreshAugmintToken = () => {
    return async dispatch => {
        dispatch({
            type: AUGMINT_TOKEN_REFRESH_REQUESTED
        });
        const augmintToken = store.getState().augmintToken.contract.instance;
        const info = await getAugmintTokenInfo(augmintToken);
        return dispatch({
            type: AUGMINT_TOKEN_REFRESHED,
            result: info
        });
    };
};

async function getAugmintTokenInfo(augmintToken) {
    const web3 = store.getState().web3Connect.web3Instance;

    let [
        symbol,
        peggedSymbol,
        bn_totalSupply,
        bn_issuedByMonetaryBoard,
        bn_decimals,
        feeAccount,
        interestEarnedAccount,
        bn_ethBalance,
        bn_ethPendingBalance,
        bn_tokenBalance,
        bn_pendingTokenBalance,
        feePt,
        feeMin,
        feeMax
    ] = await Promise.all([
        augmintToken.symbol(),
        augmintToken.peggedSymbol(),
        augmintToken.totalSupply(),
        augmintToken.issuedByMonetaryBoard(),
        augmintToken.decimals(),
        augmintToken.feeAccount(),
        augmintToken.interestEarnedAccount(),
        asyncGetBalance(augmintToken.address),
        asyncGetBalance(augmintToken.address, "pending"),
        augmintToken.balanceOf(augmintToken.address),
        augmintToken.balanceOf(augmintToken.address, {
            defaultBlock: "pending"
        }),
        augmintToken.transferFeePt(),
        augmintToken.transferFeeMin(),
        augmintToken.transferFeeMax()
    ]);

    peggedSymbol = web3.utils.toAscii(peggedSymbol);
    const bn_decimalsDiv = new BigNumber(10).pow(bn_decimals);

    let [bn_feeAccountAceBalance, bn_interestEarnedAccountAceBalance] = await Promise.all([
        augmintToken.balanceOf(feeAccount),
        augmintToken.balanceOf(interestEarnedAccount)
    ]);

    bn_feeAccountAceBalance = bn_feeAccountAceBalance.div(bn_decimalsDiv);
    bn_interestEarnedAccountAceBalance = bn_interestEarnedAccountAceBalance.div(bn_decimalsDiv);
    bn_ethPendingBalance = bn_ethPendingBalance.sub(bn_ethBalance);
    bn_tokenBalance = bn_tokenBalance.div(bn_decimalsDiv);
    bn_pendingTokenBalance = bn_pendingTokenBalance.div(bn_decimalsDiv);
    const pendingTokenBalance = bn_pendingTokenBalance.sub(bn_tokenBalance);
    const totalSupply = bn_totalSupply.div(bn_decimalsDiv);
    const issuedByMonetaryBoard = bn_issuedByMonetaryBoard.div(bn_decimalsDiv);

    return {
        symbol: symbol,
        peggedSymbol: peggedSymbol,
        decimals: bn_decimals.toNumber(),
        bn_decimalsDiv: bn_decimalsDiv,
        decimalsDiv: bn_decimalsDiv.toNumber(),
        tokenBalance: bn_tokenBalance.toNumber(),
        bn_feeAccountAceBalance: bn_feeAccountAceBalance,
        feeAccountAceBalance: bn_feeAccountAceBalance.toString(),
        bn_interestEarnedAccountAceBalance: bn_interestEarnedAccountAceBalance,
        interestEarnedAccountAceBalance: bn_interestEarnedAccountAceBalance.toString(),
        pendingTokenBalance: pendingTokenBalance.toNumber(),
        ethBalance: bn_ethBalance.toNumber(),
        bn_ethBalance: bn_ethBalance,
        bn_ethPendingBalance: bn_ethPendingBalance,
        ethPendingBalance: bn_ethPendingBalance.toNumber(),
        totalSupply: totalSupply.toNumber(),
        issuedByMonetaryBoard: issuedByMonetaryBoard.toNumber(),
        feeAccount: feeAccount,
        feePt: feePt,
        feeMin: feeMin,
        feeMax: feeMax
    };
}

export function transferToken(payload) {
    return async dispatch => {
        dispatch({
            type: AUGMINT_TOKEN_TRANSFER_REQUESTED,
            tokencAmount: payload.tokencAmount,
            payee: payload.payee
        });

        try {
            const result = await transferTokenTx(payload);
            return dispatch({
                type: TOKEN_TRANSFER_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: AUGMINT_TOKEN_TRANSFER_ERROR,
                error: error
            });
        }
    };
}
