/*
    TODO: add RATES_REFRESH_ERROR
    */
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import ratesArtifacts from "contractsBuild/Rates.json";
import ethers from "ethers";

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
        bn_weiBalance: null,
        ethBalance: null,
        bn_tokenBalance: null,
        tokenBalance: "?",

        ethFiatRate: null,
        fiatEthRate: null,

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
            const augmintToken = store.getState().augmintToken.contract.instance;
            const bytes32_peggedSymbol = store.getState().augmintToken.info.bytes32_peggedSymbol;
            const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

            const ONE_ETH = ethers.utils.bigNumberify("1000000000000000000");
            const rates = store.getState().rates.contract.instance;
            const fiatScale = 10000; // all fiat rates are stored with 4 decimals
            const provider = store.getState().web3Connect.ethers.provider;

            const [bn_ethFiatcRate, bn_tokenBalance, bn_weiBalance] = await Promise.all([
                rates.convertFromWei(bytes32_peggedSymbol, ONE_ETH).then(res => res[0]),
                augmintToken.balanceOf(rates.address).then(res => res[0]),
                provider.getBalance(rates.address)
            ]);

            return dispatch({
                type: RATES_REFRESHED,
                result: {
                    bn_weiBalance,
                    ethBalance: bn_weiBalance / ONE_ETH,
                    bn_tokenBalance,
                    tokenBalance: bn_tokenBalance / decimalsDiv,
                    bn_ethFiatcRate,
                    ethFiatRate: bn_ethFiatcRate / fiatScale,
                    fiatEthRate: 1 / bn_ethFiatcRate * fiatScale,
                    fiatScale
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
