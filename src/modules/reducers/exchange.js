import store from "modules/store";
import BigNumber from "bignumber.js";
import SolidityContract from "modules/ethereum/SolidityContract";
import EXCHANGE_artifacts from "contractsBuild/Exchange.json";
import { asyncGetBalance, getUcdBalance } from "modules/ethereum/ethHelper";
//import BigNumber from "bignumber.js";

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
        bn_ucdBalance: null,
        ucdBalance: "?",
        orderCount: "?",
        bn_totalUcdSellOrders: null,
        totalUcdSellOrders: "?",
        bn_totalEthSellOrders: null,
        totalEthSellOrders: "?",
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
                    store.getState().web3Connect.web3Instance.currentProvider,
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
            let web3 = store.getState().web3Connect.web3Instance;
            let owner = await exchange.owner();

            let bn_ethBalance = await asyncGetBalance(exchange.address);
            let bn_ucdBalance = await getUcdBalance(exchange.address);

            let bn_totalEthSellOrders = web3.fromWei(
                await exchange.totalEthSellOrders()
            );
            let bn_totalUcdSellOrders = (await exchange.totalUcdSellOrders()).div(
                new BigNumber(10000)
            );
            let orderCount = await exchange.getOrderCount();
            return dispatch({
                type: EXCHANGE_REFRESH_SUCCESS,
                result: {
                    bn_ethBalance: bn_ethBalance,
                    ethBalance: bn_ethBalance.toString(),
                    bn_ucdBalance: bn_ucdBalance,
                    ucdBalance: bn_ucdBalance.toString(),
                    bn_totalEthSellOrders: bn_totalEthSellOrders,
                    totalEthSellOrders: bn_totalEthSellOrders.toString(),
                    bn_totalUcdSellOrders: bn_totalUcdSellOrders,
                    totalUcdSellOrders: bn_totalUcdSellOrders.toString(),
                    orderCount: orderCount.toNumber(),
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
