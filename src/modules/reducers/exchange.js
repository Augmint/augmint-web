import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import exchangeArtifacts from "contractsBuild/Exchange.json";
import { asyncGetBalance } from "modules/ethereum/ethHelper";

export const EXCHANGE_CONNECT_REQUESTED = "exchange/EXCHANGE_CONNECT_REQUESTED";
export const EXCHANGE_CONNECT_SUCCESS = "exchange/EXCHANGE_CONNECT_SUCCESS";
export const EXCHANGE_CONNECT_ERROR = "exchange/EXCHANGE_CONNECT_ERROR";

export const EXCHANGE_REFRESH_REQUESTED = "exchange/EXCHANGE_REFRESH_REQUESTED";
export const EXCHANGE_REFRESH_ERROR = "exchange/EXCHANGE_REFRESH_ERROR";
export const EXCHANGE_REFRESH_SUCCESS = "exchange/EXCHANGE_REFRESH_SUCCESS";

const initialState = {
    contract: null,
    error: null,
    connectionError: false,
    isLoading: false,
    isConnected: false,
    info: {
        chunkSize: null,
        bn_ethBalance: null,
        ethBalance: "?",
        bn_tokenBalance: null,
        tokenBalance: "?",
        sellOrderCount: "?",
        buyOrderCount: "?"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case EXCHANGE_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case EXCHANGE_CONNECT_SUCCESS:
            return {
                ...state,
                contract: action.contract,
                info: action.info,
                isLoading: false,
                isConnected: true,
                connectionError: false,
                error: null
            };

        case EXCHANGE_CONNECT_ERROR:
            return {
                ...state,
                isLoading: false,
                isConnected: false,
                connectionError: action.error
            };

        case EXCHANGE_REFRESH_REQUESTED:
            return {
                isLoading: true,
                ...state
            };

        case EXCHANGE_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        case EXCHANGE_REFRESH_SUCCESS:
            return {
                ...state,
                isLoading: false,
                info: action.info
            };

        default:
            return state;
    }
};

export const connectExchange = () => {
    return async dispatch => {
        dispatch({
            type: EXCHANGE_CONNECT_REQUESTED
        });
        try {
            const contract = await SolidityContract.connectNew(store.getState().web3Connect, exchangeArtifacts);

            const info = await getExchangeInfo(contract.instance);

            return dispatch({
                type: EXCHANGE_CONNECT_SUCCESS,
                contract: contract,
                info: info
            });
        } catch (error) {
            return dispatch({
                type: EXCHANGE_CONNECT_ERROR,
                error: error
            });
        }
    };
};

export const refreshExchange = () => {
    return async dispatch => {
        dispatch({
            type: EXCHANGE_REFRESH_REQUESTED
        });
        try {
            const exchange = store.getState().exchange.contract.instance;
            const info = await getExchangeInfo(exchange);

            return dispatch({
                type: EXCHANGE_REFRESH_SUCCESS,
                info: info
            });
        } catch (error) {
            return dispatch({
                type: EXCHANGE_REFRESH_ERROR,
                error: error
            });
        }
    };
};

async function getExchangeInfo(exchange) {
    const augmintToken = store.getState().augmintToken.contract.instance;

    const [bn_ethBalance, bn_tokenBalance, orderCount, chunkSize] = await Promise.all([
        asyncGetBalance(exchange.address),
        augmintToken.balanceOf(exchange.address),
        exchange.getActiveOrderCounts(),
        exchange.CHUNK_SIZE()
    ]);

    return {
        bn_ethBalance: bn_ethBalance,
        ethBalance: bn_ethBalance.toString(),
        bn_tokenBalance: bn_tokenBalance,
        tokenBalance: bn_tokenBalance.div(10000).toString(),
        buyOrderCount: orderCount[0].toNumber(),
        sellOrderCount: orderCount[1].toNumber(),
        chunkSize: chunkSize.toNumber()
    };
}
