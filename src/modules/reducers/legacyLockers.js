import store from "modules/store";
import { fetchActiveLegacyLocksForAddressTx, releaseLegacyFundsTx } from "modules/ethereum/legacyLockersTransactions";

const LEGACY_LOCKERS_REFRESH_REQUESTED = "legacyLockers/LEGACY_LOCKERS_REFRESH_REQUESTED";
const LEGACY_LOCKERS_REFRESH_ERROR = "legacyLockers/LEGACY_LOCKERS_REFRESH_ERROR";
const LEGACY_LOCKERS_REFRESH_SUCCESS = "legacyLockers/LEGACY_LOCKERS_REFRESH_SUCCESS";

const LEGACY_LOCKERS_DISMISS_REQUESTED = "legacyLockers/LEGACY_LOCKERS_DISMISS_REQUESTED";
const LEGACY_LOCKERS_DISMISS_ERROR = "legacyLockers/LEGACY_LOCKERS_DISMISS_ERROR";
const LEGACY_LOCKERS_DISMISS_SUCCESS = "legacyLockers/LEGACY_LOCKERS_DISMISS_SUCCESS";

const LEGACY_LOCKERS_RELEASE_REQUESTED = "legacyLockers/LEGACY_LOCKERS_RELEASE_REQUESTED";
const LEGACY_LOCKERS_RELEASE_ERROR = "legacyLockers/LEGACY_LOCKERS_RELEASE_ERROR";
export const LEGACY_LOCKERS_RELEASE_SUCCESS = "legacyLockers/LEGACY_LOCKERS_RELEASE_SUCCESS";

const initialState = {
    isLoading: false,
    isLoaded: false,
    loadError: null,
    error: null,
    contracts: [],
    result: null,
    request: null
};

export default (state = initialState, action) => {
    switch (action.type) {
        case LEGACY_LOCKERS_REFRESH_REQUESTED:
            return {
                ...state,
                isLoading: true,
                loadError: null
            };

        case LEGACY_LOCKERS_REFRESH_SUCCESS:
            return {
                ...state,
                contracts: action.result,
                isLoading: false,
                isLoaded: true,
                loadError: null
            };

        case LEGACY_LOCKERS_REFRESH_ERROR:
            return {
                ...state,
                isLoading: false,
                refreshError: action.error
            };

        case LEGACY_LOCKERS_RELEASE_REQUESTED:
        case LEGACY_LOCKERS_DISMISS_REQUESTED:
            return {
                ...state,
                request: action.request
            };

        case LEGACY_LOCKERS_RELEASE_SUCCESS:
            return {
                ...state,
                result: action.result,
                contracts: action.contracts,
                request: null
            };

        case LEGACY_LOCKERS_RELEASE_ERROR:
        case LEGACY_LOCKERS_DISMISS_ERROR:
            return {
                ...state,
                isLoading: false,
                error: action.error,
                request: null
            };

        case LEGACY_LOCKERS_DISMISS_SUCCESS:
            return {
                ...state,
                contracts: action.result,
                request: null
            };

        default:
            return state;
    }
};

export const refreshLegacyLockers = () => {
    return async dispatch => {
        dispatch({
            type: LEGACY_LOCKERS_REFRESH_REQUESTED
        });
        try {
            const userAccount = store.getState().web3Connect.userAccount;
            const contracts = await fetchActiveLegacyLocksForAddressTx(userAccount);

            return dispatch({
                type: LEGACY_LOCKERS_REFRESH_SUCCESS,
                result: contracts
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_LOCKERS_REFRESH_ERROR,
                error: error
            });
        }
    };
};

export function dismissLegacyLocker(legacyLockerAddress) {
    return async dispatch => {
        dispatch({
            type: LEGACY_LOCKERS_DISMISS_REQUESTED,
            request: { legacyLockerAddress }
        });
        try {
            const contracts = [...store.getState().legacyLockers.contracts];

            const index = contracts.findIndex(item => item.address === legacyLockerAddress);
            contracts[index].isDismissed = true;

            return dispatch({
                type: LEGACY_LOCKERS_DISMISS_SUCCESS,
                result: contracts
            });
        } catch (error) {
            if (process.env.NODE_ENV !== "production") {
                return Promise.reject(error);
            }
            return dispatch({
                type: LEGACY_LOCKERS_DISMISS_ERROR,
                error: error
            });
        }
    };
}

export function releaseLegacyFunds(legacyLockerAddress, lockId) {
    return async dispatch => {
        dispatch({
            type: LEGACY_LOCKERS_RELEASE_REQUESTED,
            request: { legacyLockerAddress, lockId }
        });

        try {
            const contracts = [...store.getState().legacyLockers.contracts];
            const result = await releaseLegacyFundsTx(legacyLockerAddress, lockId);

            const contractIndex = contracts.findIndex(contract => contract.address === legacyLockerAddress);
            const lockIndex = contracts[contractIndex].locks.findIndex(lock => lock.id === lockId);

            contracts[contractIndex].locks[lockIndex].isSubmitted = true;

            return dispatch({
                type: LEGACY_LOCKERS_RELEASE_SUCCESS,
                result,
                contracts
            });
        } catch (error) {
            return dispatch({
                type: LEGACY_LOCKERS_RELEASE_ERROR,
                error: error
            });
        }
    };
}
