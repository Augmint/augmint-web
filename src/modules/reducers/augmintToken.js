/*
    TODO: separate transfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import { transferTokenTx } from "modules/ethereum/transferTransactions";

export const AUGMINT_TOKEN_REFRESH_REQUESTED = "augmintToken/AUGMINT_TOKEN_REFRESH_REQUESTED";
export const AUGMINT_TOKEN_REFRESHED = "augmintToken/AUGMINT_TOKEN_REFRESHED";
export const AUGMINT_TOKEN_REFRESH_ERROR = "augmintToken/AUGMINT_TOKEN_REFRESH_ERROR";

export const AUGMINT_TOKEN_TRANSFER_REQUESTED = "augmintToken/AUGMINT_TOKEN_TRANSFER_REQUESTED";
export const TOKEN_TRANSFER_SUCCESS = "augmintToken/TOKEN_TRANSFER_SUCCESS";
export const AUGMINT_TOKEN_TRANSFER_ERROR = "augmintToken/AUGMINT_TOKEN_TRANSFER_ERROR";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null,
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
        case AUGMINT_TOKEN_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case AUGMINT_TOKEN_REFRESHED:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                loadError: null,
                info: action.result
            };

        case AUGMINT_TOKEN_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                loadError: action.error
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
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export const refreshAugmintToken = () => {
    return async dispatch => {
        dispatch({
            type: AUGMINT_TOKEN_REFRESH_REQUESTED
        });
        const augmintTokenInstance = store.getState().contracts.latest.augmintToken.web3ContractInstance;
        const info = await getAugmintTokenInfo(augmintTokenInstance);
        return dispatch({
            type: AUGMINT_TOKEN_REFRESHED,
            result: info
        });
    };
};

async function getAugmintTokenInfo(augmintTokenInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const [symbol, bytes32_peggedSymbol, bn_totalSupply, decimals] = await Promise.all([
        augmintTokenInstance.methods.symbol().call(),
        augmintTokenInstance.methods.peggedSymbol().call(),
        augmintTokenInstance.methods.totalSupply().call(),
        augmintTokenInstance.methods.decimals().call()
    ]);

    // TODO: move feeAccount info to its own redux feeAccount state same as other contracts
    const feeAccountContract = store.getState().contracts.latest.feeAccount;

    const peggedSymbol = web3.utils.toAscii(bytes32_peggedSymbol);

    const decimalsDiv = 10 ** decimals;

    const [transferFeeStruct, bn_feeAccountTokenBalance, bn_feeAccountEthBalance] = await Promise.all([
        feeAccountContract.web3ContractInstance.methods.transferFee().call(),
        augmintTokenInstance.methods
            .balanceOf(feeAccountContract.address)
            .call()
            .then(res => res.balance),
        web3.eth.getBalance(feeAccountContract.address)
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

        feeAccountAddress: feeAccountContract.address,
        feeAccountTokenBalance: bn_feeAccountTokenBalance / decimalsDiv,
        feeAccountEthBalance
    };
}

export function transferToken(payload) {
    payload.currencyCode = "AEUR";
    payload.networkId = store.getState().web3Connect.network.id;

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
