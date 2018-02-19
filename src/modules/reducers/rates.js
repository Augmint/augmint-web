/*
    TODO: add RATES_REFRESH_ERROR
    */
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import ratesArtifacts from "contractsBuild/Rates.json";
import { asyncGetBalance } from "modules/ethereum/ethHelper";
import BigNumber from "bignumber.js";

export const RATES_CONNECT_REQUESTED = "rates/RATES_CONNECT_REQUESTED";
export const RATES_CONNECT_SUCCESS = "rates/RATES_CONNECT_SUCCESS";

export const RATES_REFRESH_REQUESTED = "rates/RATES_REFRESH_REQUESTED";
export const RATES_REFRESHED = "rates/RATES_REFRESHED";

export const RATES_ERROR = "rates/RATES_ERROR";

const initialState = {
    contract: null,
    error: null,
    connectionError: null,
    isLoading: false,
    isConnected: false,
    info: {
        bn_ethBalance: null,
        ethBalance: "?",
        bn_tokenBalance: null,
        tokenBalance: "?",
        bn_ethFiatcRate: null,
        ethFiatcRate: "?",
        bn_ethFiatRate: null,
        fiatEthRate: "?",
        bn_fiatEthRate: null,
        ethFiatRate: "?",
        fiatScale: null
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

        case RATES_ERROR:
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
                contract: await SolidityContract.connectNew(store.getState().web3Connect, ratesArtifacts)
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: RATES_ERROR,
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
        try {
            //let web3 = store.getState().web3Connect.web3Instance;
            // TODO: make these parallel
            const augmintToken = store.getState().augmintToken;
            const BN_1 = new BigNumber(1);
            const rates = store.getState().rates.contract.instance;
            const fiatScale = 10000; // 4 decimals
            const bn_ethFiatcRate = await rates.convertFromWei(augmintToken.info.peggedSymbol, 1000000000000000000);
            const bn_ethFiatRate = bn_ethFiatcRate.div(fiatScale);
            const bn_fiatEthRate = BN_1.div(bn_ethFiatcRate).times(fiatScale);
            const bn_ethBalance = await asyncGetBalance(rates.address);
            const bn_tokenBalance = (await augmintToken.contract.instance.balanceOf(rates.address)).div(10000);
            return dispatch({
                type: RATES_REFRESHED,
                result: {
                    bn_ethBalance: bn_ethBalance,
                    ethBalance: bn_ethBalance.toNumber(),
                    bn_tokenBalance: bn_tokenBalance,
                    tokenBalance: bn_tokenBalance.toNumber(),
                    bn_ethFiatcRate: bn_ethFiatcRate,
                    ethFiatcRate: bn_ethFiatcRate.toNumber(),
                    bn_ethFiatRate: bn_ethFiatRate,
                    ethFiatRate: bn_ethFiatRate.toNumber(),
                    bn_fiatEthRate: bn_fiatEthRate,
                    fiatEthRate: bn_fiatEthRate.toNumber(),
                    fiatScale: fiatScale
                }
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: RATES_ERROR,
                error: error
            });
        }
    };
};
