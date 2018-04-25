/*
    TODO: separate transfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import augmintToken_artifacts from "contractsBuild/TokenAEur.json";
import feeAccount_artifacts from "contractsBuild/FeeAccount.json";
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

        feeAccountContract: null,
        feeAccount: null,
        feeAccountTokenBalance: "?",
        feeAccountEthBalance: "?"
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
            const info = await getAugmintTokenInfo(contract.web3ContractInstance);
            return dispatch({
                type: AUGMINT_TOKEN_CONNECT_SUCCESS,
                contract,
                info
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
        const augmintTokenInstance = store.getState().augmintToken.contract.web3ContractInstance;
        const info = await getAugmintTokenInfo(augmintTokenInstance);
        return dispatch({
            type: AUGMINT_TOKEN_REFRESHED,
            result: info
        });
    };
};

async function getAugmintTokenInfo(augmintTokenInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const [symbol, bytes32_peggedSymbol, bn_totalSupply, decimals, feeAccountAddress] = await Promise.all([
        augmintTokenInstance.methods.symbol().call(),
        augmintTokenInstance.methods.peggedSymbol().call(),
        augmintTokenInstance.methods.totalSupply().call(),
        augmintTokenInstance.methods.decimals().call(),
        augmintTokenInstance.methods.feeAccount().call()
    ]);

    // TODO: move feeAccount to its own redux state same as other contracts
    const feeAccountContract = SolidityContract.connectNew(store.getState().web3Connect, feeAccount_artifacts);
    const feeAccount = { contract: feeAccountContract };

    const peggedSymbol = web3.utils.toAscii(bytes32_peggedSymbol);

    const decimalsDiv = 10 ** decimals;

    const [transferFeeStruct, bn_feeAccountTokenBalance, bn_feeAccountEthBalance] = await Promise.all([
        feeAccountContract.web3ContractInstance.methods.transferFee().call(),
        augmintTokenInstance.methods.balanceOf(feeAccountAddress).call(),
        web3.eth.getBalance(feeAccountAddress)
    ]);

    const feeAccountEthBalance = web3.utils.fromWei(bn_feeAccountEthBalance);
    const totalSupply = bn_totalSupply / decimalsDiv;

    return {
        symbol,
        peggedSymbol,
        bytes32_peggedSymbol,
        decimals,
        decimalsDiv,
        totalSupply,

        feePt: parseInt(transferFeeStruct.pt, 10) / 1000000,
        feeMin: parseInt(transferFeeStruct.min, 10) / decimalsDiv,
        feeMax: parseInt(transferFeeStruct.max, 10) / decimalsDiv,

        feeAccountAddress,
        feeAccountTokenBalance: bn_feeAccountTokenBalance / decimalsDiv,
        feeAccountEthBalance,
        feeAccount
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
