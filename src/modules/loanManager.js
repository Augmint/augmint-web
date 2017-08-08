/*
    TODO: split action creator and reducer
    TODO: handle race conditions
    TODO: add event listener to refresh product list on e_product.. events
    TODO: use selectors. eg: https://github.com/reactjs/reselect
*/

import store from './../store'
import SolidityContract from './SolidityContract';
import loanManager_artifacts from 'contractsBuild/LoanManager.json' ;
import {
    asyncGetBalance,
    getUcdBalance,
    repayLoanTx,
    newEthBackedLoanTx,
    collectLoansTx,
    fetchLoansToCollectTx,
    fetchProductsTx
} from "./ethHelper";


export const LOANMANAGER_CONNECT_REQUESTED = 'loanManager/LOANMANAGER_CONNECT_REQUESTED'
export const LOANMANAGER_CONNECT_SUCCESS = 'loanManager/LOANMANAGER_CONNECT_SUCCESS'
export const LOANMANAGER_CONNECT_ERROR = 'loanManager/LOANMANAGER_CONNECT_ERROR'

export const LOANMANAGER_REFRESH_REQUESTED = 'loanManager/LOANMANAGER_REFRESH_REQUESTED'
export const LOANMANAGER_REFRESHED= 'loanManager/LOANMANAGER_REFRESHED'

export const LOANMANAGER_PRODUCTLIST_REQUESTED = 'loanManager/LOANMANAGER_PRODUCTLIST_REQUESTED'
export const LOANMANAGER_PRODUCTLIST_RECEIVED = 'loanManager/LOANMANAGER_PRODUCTLIST_RECEIVED'
export const LOANMANAGER_PRODUCTLIST_ERROR = 'loanManager/LOANMANAGER_PRODUCTLIST_ERROR'

export const LOANMANAGER_NEWLOAN_REQUESTED = 'loanManager/LOANMANAGER_NEWLOAN_REQUESTED'
export const LOANMANAGER_NEWLOAN_CREATED = 'loanManager/LOANMANAGER_NEWLOAN_CREATED'
export const LOANMANAGER_NEWLOAN_ERROR = 'loanManager/LOANMANAGER_NEWLOAN_ERROR'

export const LOANMANAGER_REPAY_REQUESTED = 'loanManager/LOANMANAGER_REPAY_REQUESTED'
export const LOANMANAGER_REPAY_SUCCESS = 'loanManager/LOANMANAGER_REPAY_SUCCESS'
export const LOANMANAGER_REPAY_ERROR = 'loanManager/LOANMANAGER_REPAY_ERROR'

export const LOANMANAGER_COLLECT_REQUESTED = 'loanManager/LOANMANAGER_COLLECT_REQUESTED'
export const LOANMANAGER_COLLECT_SUCCESS = 'loanManager/LOANMANAGER_COLLECT_SUCCESS'
export const LOANMANAGER_COLLECT_ERROR = 'loanManager/LOANMANAGER_COLLECT_ERROR'

export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED = 'loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED'
export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED = 'loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED'
export const LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR = 'loanManager/LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR'

const initialState = {
    contract: null,
    isConnected: false,
    isLoading: true,
    ucdBalance: '?',
    ethBalance: '?',
    owner: '?',
    ratesAddress: '?',
    tokenUcdAddress: '?',
    loanCount: '?',
    productCount: '?',
    products: null,
    error: null,
    connectionError: null,
    result: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANMANAGER_CONNECT_REQUESTED:
        return {
            ...state,
            isLoading: true,
            connectionError: null,
            error: null
        }

        case LOANMANAGER_CONNECT_SUCCESS:
        return {
            ...state,
            contract: action.contract,
            isConnected: true,
            isLoading: false,
            connectionError: null
        }

        case LOANMANAGER_CONNECT_ERROR:
        return {
            ...state,
            connectionError: action.error,
            isConnected: false,
            isLoading: false
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
            owner: action.owner,
            ethBalance: action.ethBalance,
            ucdBalance: action.ucdBalance,
            loanCount: action.loanCount,
            productCount: action.productCount,
            ratesAddress: action.ratesAddress,
            tokenUcdAddress: action.tokenUcdAddress
        }

        case LOANMANAGER_PRODUCTLIST_REQUESTED:
        return {
            ...state,
            isLoading: true
        }

        case LOANMANAGER_PRODUCTLIST_RECEIVED:
        return {
            ...state,
            isLoading: false,
            products: action.products
        }

        case LOANMANAGER_PRODUCTLIST_ERROR:
        return {
            ...state,
            isLoading: false,
            error: action.error
        }

        case LOANMANAGER_NEWLOAN_REQUESTED:
        return {
            ...state,
            error: null,
            result: null,
            ethAmount: action.ethAmount,
            productId: action.productId
        }

        case LOANMANAGER_NEWLOAN_ERROR:
        return {
            ...state,
            error: action.error
        }

        case LOANMANAGER_NEWLOAN_CREATED:
        return {
            ...state,
            result: action.result
        }

        case LOANMANAGER_REPAY_REQUESTED:
        return {
            ...state,
            loanId: action.loandId,
            error: null,
            result: null
        }

        case LOANMANAGER_REPAY_SUCCESS:
        return {
            ...state,
            result: action.result
        }

        case LOANMANAGER_REPAY_ERROR:
        return {
            ...state,
            error: action.error
        }

        case LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED:
        return state;

        case LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED:
        return {
            ...state,
            loansToCollect: action.result
        }

        case LOANMANAGER_COLLECT_REQUESTED:
        return {
            ...state,
            loansToCollect: action.loansToCollect,
            error: null,
            result: null
        }

        case LOANMANAGER_COLLECT_SUCCESS:
        return {
            ...state,
            result: action.result
        }

        case LOANMANAGER_COLLECT_ERROR:
        return {
            ...state,
            error: action.error
        }

        default:
            return state
    }
}

export const connectloanManager = () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_CONNECT_REQUESTED
        });
        try {
            let contract = await SolidityContract.connectNew(
                store.getState().ethBase.web3Instance.currentProvider,
                loanManager_artifacts
            );

            return dispatch({
                type: LOANMANAGER_CONNECT_SUCCESS,
                contract: contract
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_CONNECT_ERROR,
                error: error
            });
        }
    };
};


export const refreshLoanManager =  () => {
    return async dispatch => {
        dispatch({
            type: LOANMANAGER_REFRESH_REQUESTED
        })
        let loanManager = store.getState().loanManager.contract.instance;
        // TODO: make calls paralel
        let loanCount = await loanManager.getLoanCount();
        let productCount = await loanManager.getProductCount();

        let tokenUcdAddress = await loanManager.tokenUcd();
        let ratesAddress = await loanManager.rates();
        let owner = await loanManager.owner();

        let ethBalance = await asyncGetBalance(loanManager.address);
        let ucdBalance = await getUcdBalance(loanManager.address);
        return dispatch({
                type: LOANMANAGER_REFRESHED,
                owner: owner,
                ethBalance: ethBalance,
                ucdBalance: ucdBalance,
                loanCount: loanCount.toNumber(),
                productCount: productCount.toNumber(),
                tokenUcdAddress: tokenUcdAddress,
                ratesAddress: ratesAddress
        });
    }
}

export function fetchProducts() {
    return async dispatch =>  {
        console.log( "adadsadas")
        dispatch({
            type: LOANMANAGER_PRODUCTLIST_REQUESTED
        })

        try {
            let result = await fetchProductsTx();
            return dispatch({
                type: LOANMANAGER_PRODUCTLIST_RECEIVED,
                products: result
            });
        } catch( error)  {
            return dispatch({
                type: LOANMANAGER_PRODUCTLIST_ERROR,
                error: error
            });
        }
    }
}

export function newLoan(productId, ethAmount) {
    return async dispatch =>  {
        // TODO: shall we emmit error if already submitting or enough as it is (submit disabled on form)
        dispatch({
            type: LOANMANAGER_NEWLOAN_REQUESTED,
            ethAmount: ethAmount,
            productId: productId
        })

        try {
            let result = await newEthBackedLoanTx(productId, ethAmount);
            return dispatch({
                type: LOANMANAGER_NEWLOAN_CREATED,
                result: result
            });
        } catch( error)  {
            return dispatch({
                type: LOANMANAGER_NEWLOAN_ERROR,
                error: error
            });
        }
    }
}

export function repayLoan(loanId) {
    return async dispatch =>  {
        dispatch({
            type: LOANMANAGER_REPAY_REQUESTED,
            loanId: loanId
        })

        // FIXME: per user loanId vs.  global loan id - need to be fixed in contracts
        try {
            let result = await repayLoanTx(loanId);
            return dispatch({
                type: LOANMANAGER_REPAY_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_REPAY_ERROR,
                error: error
            })
        }
    }
}

export function fetchLoansToCollect() {
    return async dispatch =>  {
        dispatch({
            type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_REQUESTED
        })

        try {
            let result = await fetchLoansToCollectTx();
            return dispatch({
                type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_RECEIVED,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_FETCH_LOANS_TO_COLLECT_ERROR,
                error: error
            })
        }
    }
}

export function collectLoans(loansToCollect) {
    return async dispatch =>  {
        dispatch({
            type: LOANMANAGER_COLLECT_REQUESTED,
            loansToCollect: loansToCollect
        })

        try {
            let result = await collectLoansTx(loansToCollect);
            return dispatch({
                type: LOANMANAGER_COLLECT_SUCCESS,
                result: result
            });
        } catch (error) {
            return dispatch({
                type: LOANMANAGER_COLLECT_ERROR,
                error: error
            })
        }
    }
}
