import store from "modules/store";
import { fetchLocksForAddressTx, releaseFundsTx } from "./lockTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";

/* List of old augmint token deploy addresses by network id */
const LEGACY_LOCKER_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0x9f5420ec1348df8de8c85dab8d240ace122204c5"],

    // rinkeby
    4: [
        "0xfb6b4803c590e564a3e6810289ab638b353a1367",
        "0x617cf9ba5c9cbecdd66412bc1d073b002aa26426",
        "0xf98ae1fb568b267a7632bf54579a153c892e2ec2"
    ]
};

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
