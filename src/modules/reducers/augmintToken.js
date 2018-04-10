/*
    TODO: separate transfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import augmintToken_artifacts from "contractsBuild/TokenAEur.json";
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
        symbol: "?",
        peggedSymbol: "?",
        bytes32_peggedSymbol: null,
        decimals: null,
        decimalsDiv: null,

        totalSupply: "?",

        feeAccount: null,
        feeAccountTokenBalance: "?",
        bn_feeAccountEthBalance: "?"
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
            const contract = SolidityContract.connectNew(store.getState().web3Connect, augmintToken_artifacts);
            const info = await getAugmintTokenInfo(contract.instance);
            return dispatch({
                type: AUGMINT_TOKEN_CONNECT_SUCCESS,
                contract: contract,
                info: info
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
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
    const [symbol, bytes32_peggedSymbol, bn_totalSupply, decimals, feeAccount, transferFeeStruct] = await Promise.all([
        augmintToken.symbol(),
        augmintToken.peggedSymbol(),
        augmintToken.totalSupply(),
        augmintToken.decimals(),
        augmintToken.feeAccount(),

        augmintToken.transferFee()
    ]);

    const peggedSymbol = web3.utils.toAscii(bytes32_peggedSymbol);

    const decimalsDiv = 10 ** decimals;

    const [bn_feeAccountTokenBalance, bn_feeAccountEthBalance] = await Promise.all([
        augmintToken.balanceOf(feeAccount),
        web3.eth.getBalance(feeAccount)
    ]);
    const feeAccountEthBalance = web3.utils.fromWei(bn_feeAccountEthBalance).toString();
    const totalSupply = bn_totalSupply / decimalsDiv;

    const [bn_feePt, bn_feeMin, bn_feeMax] = transferFeeStruct;

    return {
        symbol,
        peggedSymbol,
        bytes32_peggedSymbol,
        decimals,
        decimalsDiv,
        totalSupply,

        feePt: bn_feePt / 1000000,
        feeMin: bn_feeMin / decimalsDiv,
        feeMax: bn_feeMax / decimalsDiv,

        feeAccount,
        feeAccountTokenBalance: bn_feeAccountTokenBalance / decimalsDiv,
        feeAccountEthBalance
    };
}

export function transferToken(payload) {
    return async dispatch => {
        dispatch({
            type: AUGMINT_TOKEN_TRANSFER_REQUESTED,
            payload
        });

        try {
            const result = await transferTokenTx(payload);
            return dispatch({
                type: TOKEN_TRANSFER_SUCCESS,
                result
            });
        } catch (error) {
            return dispatch({
                type: AUGMINT_TOKEN_TRANSFER_ERROR,
                error
            });
        }
    };
}
