import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import EXCHANGE_artifacts from "contractsBuild/Exchange.json";
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
    connectionError: null,
    isLoading: false,
    isRefreshing: false,
    isConnected: false,
    info: {
        bn_ethBalance: null,
        ethBalance: "?",
        bn_tokenBalance: null,
        tokenBalance: "?",
        orderCount: "?",
        bn_totalTokenSellOrders: null,
        totalTokenSellOrders: "?",
        bn_totalEthSellOrders: null,
        totalEthSellOrders: "?",
        totalAmount: "?",
        totalCcy: "?",
        owner: "?"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case EXCHANGE_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                connectionError: null,
                error: null
            };

        case EXCHANGE_CONNECT_SUCCESS:
            return {
                ...state,
                contract: action.contract,
                isLoading: false,
                isConnected: true,
                connectionError: null,
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
                ...state
            };

        case EXCHANGE_REFRESH_ERROR:
            return {
                ...state,
                error: action.error
            };

        case EXCHANGE_REFRESH_SUCCESS:
            return {
                ...state,
                info: action.result
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
            return dispatch({
                type: EXCHANGE_CONNECT_SUCCESS,
                contract: await SolidityContract.connectNew(
                    store.getState().web3Connect.web3Instance,
                    EXCHANGE_artifacts
                )
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
            let exchange = store.getState().exchange.contract.instance;
            const augmintToken = store.getState().augmintToken.contract.instance;
            let web3 = store.getState().web3Connect.web3Instance;
            let owner = await exchange.owner();

            let bn_ethBalance = await asyncGetBalance(exchange.address);
            const bn_tokenBalance = (await augmintToken.balanceOf(exchange.address)).div(10000);

            let bn_totalEthSellOrders = web3.utils.fromWei(
                (await exchange.totalEthSellOrders()).toString() // toString() required to supress web3 error, why?
            );
            const bn_totalTokenSellOrders = (await exchange.totalTokenSellOrders()).div(10000);
            let totalTokenSellOrders = bn_totalTokenSellOrders.toString();
            let totalEthSellOrders = bn_totalEthSellOrders.toString();
            let totalAmount = 0,
                totalCcy = "";
            if (totalTokenSellOrders > 0) {
                totalAmount = totalTokenSellOrders;
                totalCcy = "ACE";
            } else if (totalEthSellOrders > 0) {
                totalAmount = totalEthSellOrders;
                totalCcy = "ETH";
            }
            let orderCount = await exchange.getOrderCount();
            return dispatch({
                type: EXCHANGE_REFRESH_SUCCESS,
                result: {
                    bn_ethBalance: bn_ethBalance,
                    ethBalance: bn_ethBalance.toString(),
                    bn_tokenBalance: bn_tokenBalance,
                    tokenBalance: bn_tokenBalance.toString(),
                    bn_totalEthSellOrders: bn_totalEthSellOrders,
                    totalEthSellOrders: totalEthSellOrders,
                    bn_totalTokenSellOrders: bn_totalTokenSellOrders,
                    totalTokenSellOrders: totalTokenSellOrders,
                    orderCount: orderCount.toNumber(),
                    totalAmount: totalAmount,
                    totalCcy: totalCcy,
                    owner: owner
                }
            });
        } catch (error) {
            return dispatch({
                type: EXCHANGE_REFRESH_ERROR,
                error: error
            });
        }
    };
};
