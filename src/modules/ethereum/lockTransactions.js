/* Loan ethereum functions
Use only from reducers.  */
import store from "modules/store";
import BigNumber from "bignumber.js";
import moment from "moment";
import { cost } from "./gas";
import { processTx } from "modules/ethereum/ethHelper";

export async function fetchLockProductsTx() {
    const lockManager = store.getState().lockManager.contract.instance;

    const [chunkSize, productCount] = await Promise.all([
        lockManager.CHUNK_SIZE().then(res => res.toNumber()),
        lockManager.getLockProductCount().then(res => res.toNumber())
    ]);

    let products = [];

    const queryCount = Math.ceil(productCount / chunkSize);

    for (let i = 0; i < queryCount; i++) {
        const productsArray = await lockManager.getLockProducts(i * chunkSize);
        const parsedProducts = parseProducts(productsArray);
        products = products.concat(parsedProducts);
    }
    return products;
}

function parseProducts(productsArray) {
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    const products = productsArray.reduce((parsed, product, index) => {
        const [bn_perTermInterest, bn_durationInSecs, bn_minimumLockAmount, bn_maxLockAmount, bn_isActive] = product;
        if (bn_durationInSecs.gt(0)) {
            const durationInSecs = bn_durationInSecs.toNumber();
            const durationInDays = durationInSecs / 60 / 60 / 24;

            const durationText = `${moment.duration(durationInSecs, "seconds").humanize()}${
                durationInDays <= 2 ? " (for testing)" : ""
            }`;

            const perTermInterest = bn_perTermInterest / 1000000;
            const interestRatePa = (perTermInterest + 1) ** (365 / durationInDays) - 1;
            parsed.push({
                id: index,
                perTermInterest,
                durationInSecs,
                durationInDays,
                durationText,
                minimumLockAmount: bn_minimumLockAmount / decimalsDiv,
                maxLockAmount: bn_maxLockAmount / decimalsDiv,
                interestRatePa,
                isActive: bn_isActive.toNumber() === 1
            });
        }
        return parsed;
    }, []);

    return products;
}

export async function newLockTx(productId, lockAmount) {
    const gasEstimate = store.getState().lockManager.info.lockCount === 0 ? cost.NEW_FIRST_LOCK_GAS : cost.NEW_LOCK_GAS;

    const txName = "New lock";

    const lockManager = store.getState().lockManager.contract.instance;
    const augmintToken = store.getState().augmintToken;

    const userAccount = store.getState().web3Connect.userAccount;
    const decimalsDiv = augmintToken.info.decimalsDiv;
    const lockAmountBNString = new BigNumber(lockAmount).mul(decimalsDiv).toString();

    const tx = augmintToken.contract.web3ContractInstance.methods
        .transferAndNotify(lockManager.address, lockAmountBNString, productId)
        .send({
            from: userAccount,
            gas: gasEstimate
        });

    const transactionHash = await processTx(tx, txName, gasEstimate);
    return { txName, transactionHash };
}

export async function releaseFundsTx(lockId) {
    const gasEstimate = cost.RELEASE_LOCK_GAS;

    const txName = "Release funds";

    const lockManager = store.getState().lockManager;

    const userAccount = store.getState().web3Connect.userAccount;

    const tx = lockManager.contract.web3ContractInstance.methods.releaseFunds(lockId).send({
        from: userAccount,
        gas: gasEstimate
    });

    const transactionHash = await processTx(tx, txName, gasEstimate);
    return { txName, transactionHash };
}

export async function fetchLocksForAddressTx(account) {
    const lockManager = store.getState().lockManager.contract.instance;

    // TODO: resolve timing of loanManager refresh in order to get chunkSize & loanCount from loanManager:
    const [chunkSize, loanCount] = await Promise.all([
        lockManager.CHUNK_SIZE().then(res => res.toNumber()),
        lockManager.getLockCountForAddress(account).then(res => res.toNumber())
    ]);
    // const chunkSize = store.getState().loanManager.info.chunkSize;
    // const loanCount = await loanManager.getLoanCountForAddress(account);

    let locks = [];

    const queryCount = Math.ceil(loanCount / chunkSize);

    for (let i = 0; i < queryCount; i++) {
        const locksArray = await lockManager.getLocksForAddress(account, i * chunkSize);
        locks = locks.concat(parseLocks(locksArray));
    }

    return locks;
}

export async function processNewLockTx(account, lockData) {
    // reprdocue an array in same format as getLocksForAddress returnvalue:
    //     [ lockOwner, lockId, amountLocked, interestEarned, lockedUntil, perTermInterest, durationInSecs]
    const lockArray = [
        lockData.lockId,
        lockData.amountLocked,
        lockData.interestEarned,
        new BigNumber(lockData.lockedUntil), // ethers.js passes these args to onnewlock as numbers unlike getLocksForAddress
        new BigNumber(lockData.perTermInterest),
        new BigNumber(lockData.durationInSecs),
        new BigNumber(1) // we don't get isActive in event data
    ];

    const parsed = parseLocks([lockArray]); // expecting array of lock data arrays
    return parsed[0];
}

function parseLocks(locksArray) {
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    const locks = locksArray.reduce((parsed, lock) => {
        const [
            bn_id,
            bn_amountLocked,
            bn_interestEarned,
            bn_lockedUntil,
            bn_perTermInterest,
            bn_durationInSecs,
            bn_isActive
        ] = lock;

        if (bn_amountLocked.gt(0)) {
            const lockedUntil = bn_lockedUntil.toNumber();
            const lockedUntilText = moment.unix(lockedUntil).format("D MMM YYYY HH:mm");
            const durationInSecs = bn_durationInSecs.toNumber();
            const durationInDays = durationInSecs / 60 / 60 / 24;
            const durationText = moment.duration(durationInSecs, "seconds").humanize();

            const perTermInterest = bn_perTermInterest / 1000000;
            const interestRatePa = (perTermInterest + 1) ** (365 / durationInDays) - 1;

            const currentTime = moment()
                .utc()
                .unix();
            const isActive = bn_isActive.eq(1) ? true : false;
            const isReleasebale = lockedUntil <= currentTime && isActive;

            let lockStateText;
            if (isReleasebale) {
                lockStateText = "Ready to release";
            } else if (isActive) {
                lockStateText = "Active";
            } else {
                lockStateText = "Released";
            }

            parsed.push({
                id: bn_id.toNumber(),
                amountLocked: bn_amountLocked / decimalsDiv,
                interestEarned: bn_interestEarned / decimalsDiv,
                lockedUntil,
                lockedUntilText,
                perTermInterest,
                interestRatePa,
                durationInSecs,
                durationInDays,
                durationText,
                isActive,
                isReleasebale,
                lockStateText
            });
        }

        return parsed;
    }, []);

    return locks;
}
