import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import TokenAEur from "abiniser/abis/TokenAEur_ABI_2ea91d34a7bfefc8f38ef0e8a5ae24a5.json";
import Rates from "abiniser/abis/Rates_ABI_73a17ebb0acc71773371c6a8e1c8e6ce.json";
import LockManager from "abiniser/abis/Locker_ABI_f59526398823aef0f0c1454d0b6b4eac.json";
import LoanManager from "abiniser/abis/LoanManager_ABI_fdf5fde95aa940c6dbfb8353c572c5fb.json";
import Exchange from "abiniser/abis/Exchange_ABI_d3e7f8a261b756f9c40da097608b21cd.json";
import StabilityBoardProxy from "abiniser/abis/StabilityBoardProxy_ABI_dd40c0d39ea8bad8a388522667a84687.json";
import PreToken from "abiniser/abis/PreToken_ABI_7f69e33e7b345c780ac9e43f391437d9.json";

export const CONTRACTS_CONNECT_REQUESTED = "contracts/CONTRACTS_CONNECT_REQUESTED";
export const CONTRACTS_CONNECT_SUCCESS = "contracts/CONTRACTS_CONNECT_SUCCESS";
export const CONTRACTS_CONNECT_ERROR = "contracts/CONTRACTS_CONNECT_ERROR";

const initialState = {
    latest: {
        augmintToken: null,
        feeAccount: null,
        rates: null,
        monetarySupervisor: null,
        loanManager: null,
        lockManager: null,
        exchange: null,
        stabilityBoardProxy: null,
        preToken: null
    },
    error: null,
    isLoading: false,
    isConnected: false
};

export default (state = initialState, action) => {
    switch (action.type) {
        case CONTRACTS_CONNECT_REQUESTED:
            return {
                ...state,
                isLoading: true,
                error: null
            };

        case CONTRACTS_CONNECT_SUCCESS:
            return {
                ...state,
                latest: action.contracts,
                isLoading: false,
                isConnected: true,
                error: null
            };

        case CONTRACTS_CONNECT_ERROR:
            return {
                ...state,
                isLoading: false,
                isConnected: false,
                error: action.error
            };

        default:
            return state;
    }
};

export const connectContracts = () => {
    return async dispatch => {
        dispatch({
            type: CONTRACTS_CONNECT_REQUESTED
        });
        try {
            const web3 = store.getState().web3Connect;
            const augmintToken = SolidityContract.connectLatest(web3, TokenAEur);
            const rates = SolidityContract.connectLatest(web3, Rates);
            const lockManager = SolidityContract.connectLatest(web3, LockManager);
            const loanManager = SolidityContract.connectLatest(web3, LoanManager);
            const exchange = SolidityContract.connectLatest(web3, Exchange);
            const stabilityBoardProxy = SolidityContract.connectLatest(web3, StabilityBoardProxy);
            const preToken = SolidityContract.connectLatest(web3, PreToken);

            const [feeAccountAddress, lockManagerMonetarySupervisorAddress] = await Promise.all([
                augmintToken.web3ContractInstance.methods.feeAccount().call(),
                lockManager.web3ContractInstance.methods.monetarySupervisor().call()
            ]);

            const feeAccount = SolidityContract.connectAt(
                store.getState().web3Connect,
                "FeeAccount",
                feeAccountAddress
            );
            const monetarySupervisor = SolidityContract.connectAt(
                web3,
                "MonetarySupervisor",
                lockManagerMonetarySupervisorAddress
            );

            const contracts = {
                augmintToken,
                rates,
                feeAccount,
                monetarySupervisor,
                lockManager,
                loanManager,
                exchange,
                stabilityBoardProxy,
                preToken
            };

            return dispatch({
                type: CONTRACTS_CONNECT_SUCCESS,
                contracts
            });
        } catch (error) {
            return dispatch({
                type: CONTRACTS_CONNECT_ERROR,
                error: error
            });
        }
    };
};
