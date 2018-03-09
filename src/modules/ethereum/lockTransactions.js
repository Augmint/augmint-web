/* Loan ethereum functions
Use only from reducers.  */
import store from "modules/store";
// import BigNumber from "bignumber.js";
import moment from "moment";
// import { cost } from "./gas";
// import { EthereumTransactionError } from "modules/ethereum/ethHelper";

// const ONE_ETH = 1000000000000000000;

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
        const [
            bn_perTermInterest,
            bn_durationInSecs,
            bn_minimumLockAmount,
            bn_isActive
        ] = product;
        const duration = bn_durationInSecs.toNumber();

        const durationText = (duration < 60 * 60 * 24 * 31  ) ? 
            `${moment.duration(duration, "seconds").asDays()} days` :
            moment.duration(duration, "seconds").humanize();

        const perTermInterest = bn_perTermInterest.toNumber();
        parsed.push({
            perTermInterest,
            durationInSecs: duration,
            durationText,
            minimumLockAmount: bn_minimumLockAmount / decimalsDiv,
            interestRatePA: perTermInterest * (60*60*24*365/duration),
            isActive: (bn_isActive.toNumber() === 1)
        });

        return parsed;

    }, []);

    return products;
}
    
   
    
    // export async function fetchLoansToCollectTx() {
    //     try {
    //         const loanManager = store.getState().loanManager.contract.instance;
    //         // TODO: resolve timing of loanManager refresh in order to get chunkSize & loanCount from loanManager:
    //         const [chunkSize, loanCount] = await Promise.all([
    //             loanManager.CHUNK_SIZE().then(res => res.toNumber()),
    //             loanManager.getLoanCount().then(res => res.toNumber())
    //         ]);
    //         // const chunkSize = store.getState().loanManager.info.chunkSize;
    //         // const loanCount = await loanManager.getLoanCount();
    
    //         let loansToCollect = [];
    
    //         const queryCount = Math.ceil(loanCount / chunkSize);
    //         for (let i = 0; i < queryCount; i++) {
    //             const loansArray = await loanManager.getLoans(i * chunkSize);
    //             const defaultedLoans = parseLoans(loansArray).filter(loan => loan.isCollectable);
    //             loansToCollect = loansToCollect.concat(defaultedLoans);
    //         }
    
    //         return loansToCollect;
    //     } catch (error) {
    //         throw new Error("fetchLoansToCollectTx failed.\n" + error);
    //     }
    // }
    