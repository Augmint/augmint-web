import store from "modules/store";
import { fetchLocksForAddressTx, releaseFundsTx } from "./lockTransactions";
import SolidityContract from "modules/ethereum/SolidityContract";

/* List of old augmint token deploy addresses by network id */
const LEGACY_LOCKER_CONTRACTS = {
    // mainnet (no deploy yet)
    1: [],

    // local ganache (migrations deploys it for manual testing)
    999: ["0xe6a48098a0a318ccec66bcd8297417e0d74585dc"],

    // rinkeby
    4: [
        // too old version, no CHUNK_SIZE(), didn't bother to make compatible: "0x617cf9ba5c9cbecdd66412bc1d073b002aa26426",
        "0xfb6b4803c590e564a3e6810289ab638b353a1367", // (oldToken2?)
        "0xf98ae1fb568b267a7632bf54579a153c892e2ec2", // oldLocker1 (oldToken3)
        "0xd0B6136C2E35c288A903E836feB9535954E4A9e9" // oldLocker2 (oldToken4)
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
