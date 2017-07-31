import store from '../store.js'
import SolidityContract from './SolidityContract';
import rates_artifacts from '../contractsBuild/Rates.json' ;

export const RATES_CONNECT_REQUESTED = 'ethBase/RATES_CONNECT_REQUESTED'
export const RATES_CONNECTED= 'ethBase/RATES_CONNECTED'

export const RATES_REFRESH_REQUESTED = 'ethBase/RATES_REFRESH_REQUESTED'
export const RATES_REFRESHED= 'ethBase/RATES_REFRESHED'

const initialState = {
    contract: null,
    balance: '?',
    owner: '?',
    usdWeiRate: null,
    isLoading: false  // TODO: this is not in use - need to refactored (see ethBase.isLoading + isConnected)
}

export default (state = initialState, action) => {
    switch (action.type) {
        case RATES_CONNECT_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case RATES_CONNECTED:
        return {
            ...state,
            isLoading: false,
            contract: action.contract
        }

        case RATES_REFRESH_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case RATES_REFRESHED:
        return {
            ...state,
            isLoading: false,
            balance: action.balance,
            owner: action.owner,
            usdWeiRate: action.usdWeiRate,
            usdEthRate: action.usdEthRate,
            ethUsdRate: action.ethUsdRate
        }

        default:
            return state
    }
}

export const connectRates =  () => {
    return async dispatch => {
        dispatch({
            type: RATES_CONNECT_REQUESTED
        })
        return dispatch({
            type: RATES_CONNECTED,
            contract: await SolidityContract.connectNew(
                store.getState().ethBase.web3Instance.currentProvider, rates_artifacts)
        })
    }
}

export const refreshRates =  () => {
    return async dispatch => {
        dispatch({
            type: RATES_REFRESH_REQUESTED
        })
        let web3 = store.getState().ethBase.web3Instance;
        let rates = store.getState().rates.contract.instance;
        let usdWeiRate = (await rates.usdWeiRate() ).toNumber();
        let usdEthRate = web3.fromWei(usdWeiRate);
        let owner = await rates.owner();
        return web3.eth.getBalance(rates.address, function(error, balance) {
            return dispatch({
                type: RATES_REFRESHED,
                balance: web3.fromWei( balance.toNumber()),
                usdWeiRate: usdWeiRate,
                usdEthRate: usdEthRate,
                ethUsdRate: 1 / usdEthRate,
                owner: owner
            })
        });
    }
}
