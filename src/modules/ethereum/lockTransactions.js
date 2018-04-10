/* Loan ethereum functions
Use only from reducers.  */
import store from "modules/store";
import BigNumber from "bignumber.js";
import moment from "moment";
import { cost } from "./gas";
import { EthereumTransactionError, processTx } from "modules/ethereum/ethHelper";

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

    const products = productsArray.reduce((parsed, product) => {
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
    const gasEstimate = store.getState().lockManager.info.lockCount === 0 ? cost.NEW_FIRST_LOAN_GAS : cost.NEW_LOAN_GAS;

    try {
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
    } catch (error) {
        throw new EthereumTransactionError("New lock failed.", error, null, gasEstimate);
    }
}
