import store from "modules/store";
import SolidityContract from "modules/ethereum/SolidityContract";
import TokenAEur from "abiniser/abis/TokenAEur_ABI_d7dd02520f2d92b2ca237f066cf2488d.json";
import Rates from "abiniser/abis/Rates_ABI_cc8bc64cd780f047eca819e6cd3b8af9.json";
import LockManager from "abiniser/abis/Locker_ABI_66e3e89133d9bbd91baac5552f21f7e1.json";
import LoanManager from "abiniser/abis/LoanManager_ABI_291572b8d2ffe95dca1733ebc1472e08.json";
import Exchange from "abiniser/abis/Exchange_ABI_a1dd11684e0aba7b453b7dbae42b2edb.json";

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
        exchange: null
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
                exchange
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
