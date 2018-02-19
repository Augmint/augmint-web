/*
    TODO: separate transfer from here to tackle isLoading race conditions
*/
import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import monetarySupervisor_artifacts from "contractsBuild/MonetarySupervisor.json";
import BigNumber from "bignumber.js";
import { asyncGetBalance } from "modules/ethereum/ethHelper";
//import BigNumber from "bignumber.js";

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

        ltdDifferenceLimit: "?",
        allowedLtdDifferenceAmount: "?",

        reserveEthBalance: "?",
        bn_reserveEthBalance: null,
        reserveEthPendingBalance: "?",
        reserveTokenBalance: "?",
        reserveTokenPendingBalance: "?",

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
            const contract = await SolidityContract.connectNew(
                store.getState().web3Connect,
                monetarySupervisor_artifacts
            );
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
    const augmintToken = store.getState().augmintToken.contract.instance;
    const [
        bn_decimals,

        augmintTokenAddress,
        interestEarnedAccountAddress,
        augmintReservesAddress,

        bn_issuedByMonetaryBoard,

        bn_totalLoanAmount,
        bn_totalLockedAmount,

        bn_ltdDifferenceLimit,
        bn_allowedLtdDifferenceAmount
    ] = await Promise.all([
        augmintToken.decimals(),

        monetarySupervisor.augmintToken(),
        monetarySupervisor.interestEarnedAccount(),
        monetarySupervisor.augmintReserves(),

        monetarySupervisor.issuedByMonetaryBoard(),

        monetarySupervisor.totalLoanAmount(),
        monetarySupervisor.totalLockedAmount(),

        monetarySupervisor.ltdDifferenceLimit(), // TODO: use monetarySupervisor.getParams() to reduce calls
        monetarySupervisor.allowedLtdDifferenceAmount()
    ]);

    const bn_decimalsDiv = new BigNumber(10).pow(bn_decimals);
    const issuedByMonetaryBoard = bn_issuedByMonetaryBoard.div(bn_decimalsDiv).toNumber();
    const totalLoanAmount = bn_totalLoanAmount.div(bn_decimalsDiv).toNumber();
    const totalLockedAmount = bn_totalLockedAmount.div(bn_decimalsDiv).toNumber();
    const ltdDifferenceLimit = bn_ltdDifferenceLimit.div(1000000).toNumber();
    const allowedLtdDifferenceAmount = bn_allowedLtdDifferenceAmount.div(bn_decimalsDiv).toNumber();

    const [
        bn_reserveEthBalance,
        bn_reserveEthPendingBalance,
        bn_reserveTokenBalance,
        bn_reserveTokenPendingBalance,
        bn_interestEarnedAccountTokenBalance
    ] = await Promise.all([
        asyncGetBalance(augmintReservesAddress),
        asyncGetBalance(augmintReservesAddress, "pending"),
        augmintToken.balanceOf(augmintReservesAddress),
        augmintToken.balanceOf(augmintReservesAddress, {
            defaultBlock: "pending"
        }),
        augmintToken.balanceOf(interestEarnedAccountAddress)
    ]);

    const reserveEthBalance = bn_reserveEthBalance.toNumber();
    const reserveEthPendingBalance = bn_reserveEthPendingBalance.sub(bn_reserveEthBalance).toNumber();
    const reserveTokenBalance = bn_reserveTokenBalance.div(bn_decimalsDiv).toNumber();
    const reserveTokenPendingBalance = bn_reserveTokenPendingBalance.div(bn_decimalsDiv).toNumber();
    const interestEarnedAccountTokenBalance = bn_interestEarnedAccountTokenBalance.div(bn_decimalsDiv).toNumber();

    return {
        augmintToken: augmintTokenAddress,
        interestEarnedAccount: interestEarnedAccountAddress,
        augmintReserves: augmintReservesAddress,

        issuedByMonetaryBoard,
        totalLoanAmount,
        totalLockedAmount,

        ltdDifferenceLimit,
        allowedLtdDifferenceAmount,

        reserveEthBalance,
        bn_reserveEthBalance,
        reserveEthPendingBalance,
        reserveTokenBalance,
        reserveTokenPendingBalance,

        interestEarnedAccountTokenBalance
    };
}
