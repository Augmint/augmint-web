/*
    TODO: add RATES_REFRESH_ERROR
    */
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import rates_artifacts from "contractsBuild/Rates.json";
import { asyncGetBalance, getUcdBalance } from "modules/ethereum/ethHelper";
import BigNumber from "bignumber.js";

export const RATES_CONNECT_REQUESTED = "rates/RATES_CONNECT_REQUESTED";
export const RATES_CONNECT_SUCCESS = "rates/RATES_CONNECT_SUCCESS";
export const RATES_CONNECT_ERROR = "rates/RATES_CONNECT_ERROR";

export const RATES_REFRESH_REQUESTED = "rates/RATES_REFRESH_REQUESTED";
export const RATES_REFRESHED = "rates/RATES_REFRESHED";

const initialState = {
    contract: null,
    error: null,
    connectionError: null,
    isLoading: false,
    isConnected: false,
    info: {
        bn_ethBalance: null,
        ethBalance: "?",
        bn_ucdBalance: null,
        ucdBalance: "?",
        bn_ethUsdcRate: null,
        ethUsdcRate: "?",
        bn_ethUsdRate: null,
        usdEthRate: "?",
        bn_usdEthRate: null,
        ethUsdRate: "?",
        owner: "?",
        usdScale: null
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case RATES_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                connectionError: null,
                error: null
            };

        case RATES_CONNECT_SUCCESS:
            return {
                ...state,
                contract: action.contract,
                isLoading: false,
                isConnected: true,
                connectionError: null,
                error: null
            };

        case RATES_CONNECT_ERROR:
            return {
                ...state,
                isLoading: false,
                isConnected: false,
                connectionError: action.error
            };

        case RATES_REFRESH_REQUESTED:
            return {
                ...state
            };

        case RATES_REFRESHED:
            return {
                ...state,
                info: action.result
            };

        default:
            return state;
    }
};

export const connectRates = () => {
    return async dispatch => {
        dispatch({
            type: RATES_CONNECT_REQUESTED
        });
        try {
            return dispatch({
                type: RATES_CONNECT_SUCCESS,
                contract: await SolidityContract.connectNew(store.getState().web3Connect.web3Instance, rates_artifacts)
            });
        } catch (error) {
            return dispatch({
                type: RATES_CONNECT_ERROR,
                error: error
            });
        }
    };
};

export const refreshRates = () => {
    return async dispatch => {
        dispatch({
            type: RATES_REFRESH_REQUESTED
        });
        //let web3 = store.getState().web3Connect.web3Instance;
        let rates = store.getState().rates.contract.instance;
        let usdScale = await rates.USD_SCALE();
        let bn_ethUsdcRate = await rates.ethUsdcRate();
        let bn_ethUsdRate = bn_ethUsdcRate.div(usdScale);
        let BN_1 = new BigNumber(1);
        let bn_usdEthRate = BN_1.div(bn_ethUsdcRate).times(usdScale);
        let owner = await rates.owner();

        let bn_ethBalance = await asyncGetBalance(rates.address);
        let bn_ucdBalance = await getUcdBalance(rates.address);
        return dispatch({
            type: RATES_REFRESHED,
            result: {
                bn_ethBalance: bn_ethBalance,
                ethBalance: bn_ethBalance.toNumber(),
                bn_ucdBalance: bn_ucdBalance,
                ucdBalance: bn_ucdBalance.toNumber(),
                bn_ethUsdcRate: bn_ethUsdcRate,
                ethUsdcRate: bn_ethUsdcRate.toNumber(),
                bn_ethUsdRate: bn_ethUsdRate,
                ethUsdRate: bn_ethUsdRate.toNumber(),
                bn_usdEthRate: bn_usdEthRate,
                usdEthRate: bn_usdEthRate.toNumber(),
                usdScale: usdScale.toNumber(),
                owner: owner
            }
        });
    };
};
