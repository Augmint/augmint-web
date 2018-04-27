/*
    TODO: separate transfer from here to tackle isLoading race conditions
*/
import store from "modules/store";

import { ONE_ETH_IN_WEI, DECIMALS_DIV } from "utils/constants";

export const MONETARY_SUPERVISOR_REFRESH_REQUESTED = "monetarySupervisor/MONETARY_SUPERVISOR_REFRESH_REQUESTED";
export const MONETARY_SUPERVISOR_REFRESHED = "monetarySupervisor/MONETARY_SUPERVISOR_REFRESHED";
export const MONETARY_SUPERVISOR_REFRESH_ERROR = "monetarySupervisor/MONETARY_SUPERVISOR_REFRESH_ERROR";

const initialState = {
    isLoading: false,
    isLoaded: false,
    error: null,
    info: {
        augmintToken: null,
        interestEarnedAccount: null,
        augmintReserves: null,

        issuedByMonetaryBoard: "?",

        totalLoanAmount: "?",
        totalLockedAmount: "?",
        ltdPercent: "?",

        ltdLoanDifferenceLimit: "?",
        ltdLockDifferenceLimit: "?",
        allowedLtdDifferenceAmount: "?",

        maxLoanByLtd: "?",
        maxLockByLtd: "?",

        reserveEthBalance: "?",
        bn_reserveWeiBalance: null,

        reserveTokenBalance: "?",

        interestEarnedAccountTokenBalance: "?"
    }
};

export default (state = initialState, action) => {
    switch (action.type) {
        case MONETARY_SUPERVISOR_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case MONETARY_SUPERVISOR_REFRESHED:
            return {
                ...state,
                isLoading: false,
                isLoaded: true,
                info: action.result
            };

        case MONETARY_SUPERVISOR_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error
            };

        default:
            return state;
    }
};

export const refreshMonetarySupervisor = () => {
    return async dispatch => {
        dispatch({ type: MONETARY_SUPERVISOR_REFRESH_REQUESTED });
        try {
            const monetarySupervisorInstance = store.getState().contracts.latest.monetarySupervisor
                .web3ContractInstance;
            const info = await getMonetarySupervisorInfo(monetarySupervisorInstance);
            return dispatch({ type: MONETARY_SUPERVISOR_REFRESHED, result: info });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({ type: MONETARY_SUPERVISOR_REFRESH_ERROR, error: error });
        }
    };
};

async function getMonetarySupervisorInfo(monetarySupervisorInstance) {
    const web3 = store.getState().web3Connect.web3Instance;
    const augmintTokenInstance = store.getState().contracts.latest.augmintToken.web3ContractInstance;

    const [
        augmintTokenAddress,
        interestEarnedAccountAddress,
        augmintReservesAddress,

        bn_issuedByMonetaryBoard,

        bn_totalLoanAmount,
        bn_totalLockedAmount,

        ltdParams,

        bn_maxLockByLtd,
        bn_maxLoanByLtd
    ] = await Promise.all([
        monetarySupervisorInstance.methods.augmintToken().call(),
        monetarySupervisorInstance.methods.interestEarnedAccount().call(),
        monetarySupervisorInstance.methods.augmintReserves().call(),

        monetarySupervisorInstance.methods.issuedByMonetaryBoard().call(),

        monetarySupervisorInstance.methods.totalLoanAmount().call(),
        monetarySupervisorInstance.methods.totalLockedAmount().call(),

        monetarySupervisorInstance.methods.ltdParams().call(),

        monetarySupervisorInstance.methods.getMaxLockAmountAllowedByLtd().call(),
        monetarySupervisorInstance.methods.getMaxLoanAmountAllowedByLtd().call()
    ]);

    const issuedByMonetaryBoard = bn_issuedByMonetaryBoard / DECIMALS_DIV;
    const totalLoanAmount = bn_totalLoanAmount / DECIMALS_DIV;
    const totalLockedAmount = bn_totalLockedAmount / DECIMALS_DIV;

    const ltdPercent = totalLockedAmount === 0 ? 0 : totalLoanAmount / totalLockedAmount;

    const ltdLockDifferenceLimit = ltdParams.lockDifferenceLimit / 1000000;
    const ltdLoanDifferenceLimit = ltdParams.loanDifferenceLimit / 1000000;
    const allowedLtdDifferenceAmount = ltdParams.allowedDifferenceAmount / DECIMALS_DIV;

    const maxLockByLtd = bn_maxLockByLtd / DECIMALS_DIV;
    const maxLoanByLtd = bn_maxLoanByLtd / DECIMALS_DIV;

    const [bn_reserveWeiBalance, bn_reserveTokenBalance, bn_interestEarnedAccountTokenBalance] = await Promise.all([
        web3.eth.getBalance(augmintReservesAddress),
        augmintTokenInstance.methods.balanceOf(augmintReservesAddress).call(),
        augmintTokenInstance.methods.balanceOf(interestEarnedAccountAddress).call()
    ]);

    const reserveEthBalance = bn_reserveWeiBalance / ONE_ETH_IN_WEI;
    const reserveTokenBalance = bn_reserveTokenBalance / DECIMALS_DIV;
    const interestEarnedAccountTokenBalance = bn_interestEarnedAccountTokenBalance / DECIMALS_DIV;

    return {
        augmintToken: augmintTokenAddress,
        interestEarnedAccount: interestEarnedAccountAddress,
        augmintReserves: augmintReservesAddress,

        issuedByMonetaryBoard,
        totalLoanAmount,
        totalLockedAmount,
        ltdPercent,

        ltdLockDifferenceLimit,
        ltdLoanDifferenceLimit,
        allowedLtdDifferenceAmount,

        maxLockByLtd,
        maxLoanByLtd,

        reserveEthBalance,
        bn_reserveWeiBalance,

        reserveTokenBalance,

        interestEarnedAccountTokenBalance
    };
}
