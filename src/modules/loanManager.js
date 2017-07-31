import store from '../store.js'
import SolidityContract from './SolidityContract';
import loanManager_artifacts from '../contractsBuild/LoanManager.json' ;

export const LOANMANAGER_CONNECT_REQUESTED = 'loanManager/LOANMANAGER_CONNECT_REQUESTED'
export const LOANMANAGER_CONNECTED= 'loanManager/LOANMANAGER_CONNECTED'

export const LOANMANAGER_REFRESH_REQUESTED = 'loanManager/LOANMANAGER_REFRESH_REQUESTED'
export const LOANMANAGER_REFRESHED= 'loanManager/LOANMANAGER_REFRESHED'

const initialState = {
    contract: null,
    balance: '?',
    ratesAddress: '?',
    tokenUcdAddress: '?',
    loanCount: '?',
    isLoading: false  // TODO: this is not in use - need to refactored (see ethBase.isLoading + isConnected)
}

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANMANAGER_CONNECT_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case LOANMANAGER_CONNECTED:
        return {
            ...state,
            isLoading: false,
            contract: action.contract
        }

        case LOANMANAGER_REFRESH_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case LOANMANAGER_REFRESHED:
        return {
            ...state,
            isLoading: false,
            balance: action.balance,
            loanCount: action.loanCount,
            ratesAddress: action.ratesAddress,
            tokenUcdAddress: action.tokenUcdAddress
        }

        default:
            return state
    }
}

export const connectloanManager =  () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_CONNECT_REQUESTED
        })
        return dispatch({
            type: LOANMANAGER_CONNECTED,
            contract: await SolidityContract.connectNew(
                store.getState().ethBase.web3Instance.currentProvider, loanManager_artifacts)
        })
    }
}

export const refreshLoanManager =  () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_REFRESH_REQUESTED
        })
        let loanManager = store.getState().loanManager.contract.instance;
        let web3 = store.getState().ethBase.web3Instance;
        let loanCount = await loanManager.getLoanCount();
        let tokenUcdAddress = await loanManager.tokenUcd();
        let ratesAddress = await loanManager.rates();
        return web3.eth.getBalance(loanManager.address, function(error, balance) {
            dispatch({
                type: LOANMANAGER_REFRESHED,
                balance: web3.fromWei( balance.toNumber()),
                loanCount: loanCount.toNumber(),
                tokenUcdAddress: tokenUcdAddress,
                ratesAddress: ratesAddress
            });
        });
    }
}
