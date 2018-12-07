import store from "modules/store";
import { fetchLocksForAddressTx, releaseFundsTx } from "./lockTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";
import { LEGACY_LOCKER_CONTRACTS } from "utils/constants";

export async function fetchActiveLegacyLocksForAddressTx(_userAccount) {
    const web3 = store.getState().web3Connect;
    const legacyLockerAddresses = LEGACY_LOCKER_CONTRACTS[web3.network.id];
    const userAccount = _userAccount.toLowerCase();

    const queryTxs = legacyLockerAddresses.map(address => {
        const legacyContract = SolidityContract.connectAt(web3, "Locker", address);

        return fetchLocksForAddressTx(legacyContract.web3ContractInstance, userAccount);
    });

    const legacyLocks = await Promise.all(queryTxs);

    const ret = legacyLocks.map((locks, i) => ({
        address: legacyLockerAddresses[i],
        locks: locks.filter(lock => lock.isActive)
    }));

    return ret;
}

export async function releaseLegacyFundsTx(legacyLockerAddress, lockId) {
    const web3 = store.getState().web3Connect;
    const legacyContract = SolidityContract.connectAt(web3, "Locker", legacyLockerAddress);

    return releaseFundsTx(legacyContract.web3ContractInstance, lockId);
}
