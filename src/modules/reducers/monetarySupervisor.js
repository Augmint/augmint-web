/*
    TODO: separate transfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import monetarySupervisor_artifacts from "contractsBuild/MonetarySupervisor.json";

import { ONE_ETH_IN_WEI } from "utils/constants";

export const MONETARY_SUPERVISOR_CONNECT_REQUESTED = "augmintToken/MONETARY_SUPERVISOR_CONNECT_REQUESTED";
export const MONETARY_SUPERVISOR_CONNECT_SUCCESS = "augmintToken/MONETARY_SUPERVISOR_CONNECT_SUCCESS";
export const MONETARY_SUPERVISOR_CONNECT_ERROR = "augmintToken/MONETARY_SUPERVISOR_CONNECT_ERROR";

export const MONETARY_SUPERVISOR_REFRESH_REQUESTED = "augmintToken/MONETARY_SUPERVISOR_REFRESH_REQUESTED";
export const MONETARY_SUPERVISOR_REFRESHED = "augmintToken/MONETARY_SUPERVISOR_REFRESHED";

const initialState = {
    contract: null,
    isLoading: false,
    isConnected: false,
    error: null,
    connectionError: null,
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
        case MONETARY_SUPERVISOR_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                connectionError: null,
                error: null
            };

        case MONETARY_SUPERVISOR_CONNECT_SUCCESS:
            return {
                ...state,
                isLoading: false,
                isConnected: true,
                error: null,
                connectionError: null,
                contract: action.contract,
                info: action.info
            };

        case MONETARY_SUPERVISOR_CONNECT_ERROR:
            return {
                ...state,
                isLoading: false,
                isConnected: false,
                connectionError: action.error
            };

        case MONETARY_SUPERVISOR_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true
            };

        case MONETARY_SUPERVISOR_REFRESHED:
            return {
                ...state,
                isLoading: false,
                info: action.result
            };

        default:
            return state;
    }
};

export const connectMonetarySupervisor = () => {
    return async dispatch => {
        dispatch({
            type: MONETARY_SUPERVISOR_CONNECT_REQUESTED
        });

        try {
            const contract = SolidityContract.connectNew(store.getState().web3Connect, monetarySupervisor_artifacts);
            const info = await getMonetarySupervisorInfo(contract.instance);
            return dispatch({
                type: MONETARY_SUPERVISOR_CONNECT_SUCCESS,
                contract: contract,
                info: info
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: MONETARY_SUPERVISOR_CONNECT_ERROR,
                error: error
            });
        }
    };
};

export const refreshMonetarySupervisor = () => {
    return async dispatch => {
        dispatch({
            type: MONETARY_SUPERVISOR_REFRESH_REQUESTED
        });
        const monetarySupervisor = store.getState().monetarySupervisor.contract.instance;
        const info = await getMonetarySupervisorInfo(monetarySupervisor);
        return dispatch({
            type: MONETARY_SUPERVISOR_REFRESHED,
            result: info
        });
    };
};

async function getMonetarySupervisorInfo(monetarySupervisor) {
    const web3 = store.getState().web3Connect.web3Instance;
    const augmintToken = store.getState().augmintToken.contract.instance;
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    const [
        augmintTokenAddress,
        interestEarnedAccountAddress,
        augmintReservesAddress,

        bn_issuedByMonetaryBoard,

        bn_totalLoanAmount,
        bn_totalLockedAmount,

        paramsArray,

        bn_maxLockByLtd,
        bn_maxLoanByLtd
    ] = await Promise.all([
        monetarySupervisor.augmintToken(),
        monetarySupervisor.interestEarnedAccount(),
        monetarySupervisor.augmintReserves(),

        monetarySupervisor.issuedByMonetaryBoard(),

        monetarySupervisor.totalLoanAmount(),
        monetarySupervisor.totalLockedAmount(),

        monetarySupervisor.getParams(),

        monetarySupervisor.getMaxLockAmountAllowedByLtd(),
        monetarySupervisor.getMaxLoanAmountAllowedByLtd()
    ]);

    const [bn_ltdLockDifferenceLimit, bn_ltdLoanDifferenceLimit, bn_allowedLtdDifferenceAmount] = paramsArray;

    const issuedByMonetaryBoard = bn_issuedByMonetaryBoard / decimalsDiv;
    const totalLoanAmount = bn_totalLoanAmount / decimalsDiv;
    const totalLockedAmount = bn_totalLockedAmount / decimalsDiv;

    const ltdPercent = totalLockedAmount === 0 ? 0 : totalLoanAmount / totalLockedAmount;

    const ltdLockDifferenceLimit = bn_ltdLockDifferenceLimit / 1000000;
    const ltdLoanDifferenceLimit = bn_ltdLoanDifferenceLimit / 1000000;
    const allowedLtdDifferenceAmount = bn_allowedLtdDifferenceAmount / decimalsDiv;

    const maxLockByLtd = bn_maxLockByLtd / decimalsDiv;
    const maxLoanByLtd = bn_maxLoanByLtd / decimalsDiv;

    const [bn_reserveWeiBalance, bn_reserveTokenBalance, bn_interestEarnedAccountTokenBalance] = await Promise.all([
        web3.eth.getBalance(augmintReservesAddress),
        augmintToken.balanceOf(augmintReservesAddress),
        augmintToken.balanceOf(interestEarnedAccountAddress)
    ]);

    const reserveEthBalance = bn_reserveWeiBalance / ONE_ETH_IN_WEI;
    const reserveTokenBalance = bn_reserveTokenBalance / decimalsDiv;
    const interestEarnedAccountTokenBalance = bn_interestEarnedAccountTokenBalance / decimalsDiv;

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
