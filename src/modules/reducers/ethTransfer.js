/*
    TODO: maybe add it to userTransfers/ethTransfers{} ?
*/
import store from "modules/store";
import { transferEthTx } from "modules/ethereum/transferTransactions";

export const ETH_TRANSFER_REQUESTED = "ethTransfer/ETH_TRANSFER_REQUESTED";
export const ETH_TRANSFER_SUCCESS = "ethTransfer/ETH_TRANSFER_SUCCESS";
export const ETH_TRANSFER_ERROR = "ethTransfer/ETH_TRANSFER_ERROR";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case ETH_TRANSFER_REQUESTED:
            return {
                ...state,
                error: null,
                tokenAmount: action.tokenAmount,
                payee: action.payee
            };

        case ETH_TRANSFER_SUCCESS:
            return {
                ...state,
                result: action.result
            };

        case ETH_TRANSFER_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export function transferEth(payload) {
    payload.currencyCode = "ETH";
    payload.networkId = store.getState().web3Connect.network.id;

    return async dispatch => {
        dispatch({
            type: ETH_TRANSFER_REQUESTED,
            payload
        });

        try {
            const result = await transferEthTx(payload);
            return dispatch({
                type: ETH_TRANSFER_SUCCESS,
                result
            });
        } catch (error) {
            return dispatch({
                type: ETH_TRANSFER_ERROR,
                error
            });
        }
    };
}
