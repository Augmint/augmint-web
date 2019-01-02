import store from "modules/store";

import { DECIMALS_DIV } from "utils/constants";

export const EXCHANGE_REFRESH_REQUESTED = "exchange/EXCHANGE_REFRESH_REQUESTED";
export const EXCHANGE_REFRESH_ERROR = "exchange/EXCHANGE_REFRESH_ERROR";
export const EXCHANGE_REFRESH_SUCCESS = "exchange/EXCHANGE_REFRESH_SUCCESS";

const initialState = {
    loadError: null,
    isLoading: false,
    isLoaded: false,
    info: {
        ethBalance: "?",
        bn_tokenBalance: null,
        tokenBalance: "?",
        sellOrderCount: "?",
        buyOrderCount: "?"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case EXCHANGE_REFRESH_REQUESTED:
            return {
                isLoading: true,
                ...state
            };

        case EXCHANGE_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                loadError: action.error
            };

        case EXCHANGE_REFRESH_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                info: action.info
            };

        default:
            return state;
    }
};

export const refreshExchange = () => {
    return async dispatch => {
        dispatch({ type: EXCHANGE_REFRESH_REQUESTED });
        try {
            const exchangeInstance = store.getState().contracts.latest.exchange.web3ContractInstance;
            const info = await getExchangeInfo(exchangeInstance);

            return dispatch({ type: EXCHANGE_REFRESH_SUCCESS, info });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({ type: EXCHANGE_REFRESH_ERROR, error });
        }
    };
};

async function getExchangeInfo(exchangeInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const augmintToken = store.getState().contracts.latest.augmintToken.web3ContractInstance;

    const [bn_weiBalance, bn_tokenBalance, orderCount] = await Promise.all([
        web3.eth.getBalance(exchangeInstance._address),
        augmintToken.methods.balanceOf(exchangeInstance._address).call(),
        exchangeInstance.methods.getActiveOrderCounts().call()
    ]);

    return {
        bn_ethBalance: bn_weiBalance,
        ethBalance: web3.utils.fromWei(bn_weiBalance),
        bn_tokenBalance: bn_tokenBalance,
        tokenBalance: bn_tokenBalance / DECIMALS_DIV,
        buyOrderCount: parseInt(orderCount.buyTokenOrderCount, 10),
        sellOrderCount: parseInt(orderCount.sellTokenOrderCount, 10)
    };
}
