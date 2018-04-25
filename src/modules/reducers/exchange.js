import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import Exchange from "abiniser/abis/Exchange_ABI_7595b255e567ae1d0eeef4460d0b0c16.json";

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
            const contract = SolidityContract.connectLatest(store.getState().web3Connect, Exchange);

            const info = await getExchangeInfo(contract.web3ContractInstance);

            return dispatch({
                type: EXCHANGE_CONNECT_SUCCESS,
                contract: contract,
                info: info
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
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
            const exchangeInstance = store.getState().exchange.contract.web3ContractInstance;
            const info = await getExchangeInfo(exchangeInstance);

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

async function getExchangeInfo(exchangeInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const augmintToken = store.getState().augmintToken.contract.web3ContractInstance;
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    const [bn_weiBalance, bn_tokenBalance, orderCount, chunkSize] = await Promise.all([
        web3.eth.getBalance(exchangeInstance._address),
        augmintToken.methods.balanceOf(exchangeInstance._address).call(),
        exchangeInstance.methods.getActiveOrderCounts().call(),
        exchangeInstance.methods.CHUNK_SIZE().call()
    ]);

    return {
        bn_ethBalance: bn_weiBalance,
        ethBalance: web3.utils.fromWei(bn_weiBalance),
        bn_tokenBalance: bn_tokenBalance,
        tokenBalance: bn_tokenBalance / decimalsDiv,
        buyOrderCount: parseInt(orderCount.buyTokenOrderCount, 10),
        sellOrderCount: parseInt(orderCount.sellTokenOrderCount, 10),
        chunkSize: parseInt(chunkSize, 10)
    };
}
