/* Loans for one account
    TODO: do some caching. consider selectors for it: https://github.com/reactjs/reselect
    TODO: add listener to new loan event & refresh loans if it's the current users'
    TODO: move formating to separate lib (from all modules)
*/
import store from './../store'
import ethBackedLoan_artifacts from '../contractsBuild/EthBackedLoan.json' ;
import SolidityContract from './SolidityContract';
import moment from 'moment';
import { asyncGetBalance, getUcdBalance } from './ethHelper'

export const LOANS_LOANLIST_REQUESTED = 'loans/LOANS_LOANLIST_REQUESTED'
export const LOANS_LOANLIST_RECEIVED = 'loans/LOANS_LOANLIST_RECEIVED'

const initialState = {
    loans: null
}

export default (state = initialState, action) => {
    switch (action.type) {
        case LOANS_LOANLIST_REQUESTED:
        return state;

        case LOANS_LOANLIST_RECEIVED:
        return {
            ...state,
            loans: action.loans
        }

        default:
        return state;
    }
}

export function fetchLoans(userAccount) {
    return async dispatch => {

        dispatch({
            type: LOANS_LOANLIST_REQUESTED
        })

        let loanManager = store.getState().loanManager.contract.instance;
        let loanIds = await loanManager.getLoanIds(userAccount);

        let actions = loanIds.map( fetchLoanDetails );
        let loans = await Promise.all( actions ); // queries in paralel...

        return dispatch({
            type: LOANS_LOANLIST_RECEIVED,
            loans: loans
        })
    }
}

// TODO: make this a reducer?
export async function fetchLoanDetails(loanId) {
    let loanManager = store.getState().loanManager.contract.instance;
    let res = await loanManager.loanPointers(loanId);
    let loanContractAddress = res[0];
    let ethBalance = await asyncGetBalance( loanContractAddress);
    let ucdBalance = await getUcdBalance(loanContractAddress);

    let loanContract = await SolidityContract.connectNewAt(
        store.getState().ethBase.web3Instance.currentProvider, ethBackedLoan_artifacts,
        loanContractAddress);
    let l = await loanContract.instance.getDetails(); // tuple with loan details
    let loanState = l[3].toNumber();
    let loanStateText;
    switch (loanState)
    {
        case 0: loanStateText = 'Open'; break;
        case 1: loanStateText = 'Repaid'; break;
        case 2: loanStateText = 'Defaulted'; break;
        default: loanStateText =  'Invalid state';
    }

    let disbursementDate = l[7].toNumber();
    let disbursementDateText = moment.unix(disbursementDate).format("D MMM YYYY HH:mm:ss");
    let maturity = l[8].toNumber();
    let maturityText = moment.unix(maturity).format("D MMM YYYY HH:mm");
    let repayPeriod = l[9].toNumber();
    let loan = {
        ethBalance: ethBalance,
        ucdBalance: ucdBalance,
        loanId: loanId.toNumber(),
        loanContract: loanContract,
        borrower: l[0], // 0 the borrower
        loanManagerAddress: l[1], // 1 loan manager contract instance
        tokenUcdAddress: l[2], // 2 tokenUcd instance
        loanState: loanState, // 3
        loanStateText: loanStateText,
        ucdDueAtMaturity: l[4].toNumber() / 10000, // 4 nominal loan amount in UCD (non discounted amount)
        disbursedLoanInUcd: l[5].toNumber() / 10000, // 5
        term: l[6].toNumber(),  // 6 duration of loan
        termText: moment.duration(l[6].toNumber(), "seconds").humanize() ,
        disbursementDate: disbursementDate,
        disbursementDateText: disbursementDateText, // 7
        maturity: maturity, // 8 disbursementDate + term
        maturityText: maturityText,
        repayPeriod: repayPeriod,  // 9
        repayPeriodText: moment.duration(repayPeriod, "minutes").humanize(),
        repayBy: repayPeriod + maturity,
        repayByText: moment.unix(repayPeriod + maturity).format("D MMM YYYY HH:mm")
    }
    return loan;
}
