/* Loan ethereum functions
    Use only from reducers.  */
    import store from "modules/store";
    // import BigNumber from "bignumber.js";
    // import moment from "moment";
    // import { cost } from "./gas";
    // import { EthereumTransactionError } from "modules/ethereum/ethHelper";
    
    // const ONE_ETH = 1000000000000000000;
    
    export async function fetchLockProductsTx() {
        const lockManager = store.getState().lockManager.contract.instance;
        debugger;
        
    }

    export async function fetchProductsTx() {
        const loanManager = store.getState().loanManager.contract.instance;
    
        // TODO: resolve timing of loanManager refresh in order to get chunkSize & productCount from loanManager:
        const [chunkSize, productCount] = await Promise.all([
            loanManager.CHUNK_SIZE().then(res => res.toNumber()),
            loanManager.getProductCount().then(res => res.toNumber())
        ]);
        // const chunkSize = store.getState().loanManager.info.chunkSize;
        // const productCount = store.getState().loanManager.info.productCount;
    
        let products = [];
    
        const queryCount = Math.ceil(productCount / chunkSize);
    
        for (let i = 0; i < queryCount; i++) {
            const productsArray = await loanManager.getProducts(i * chunkSize);
            const parsedProducts = parseProducts(productsArray);
            products = products.concat(parsedProducts);
        }
    
        return products;
    }
    
    function parseProducts(productsArray) {
        const ppmDiv = 1000000;
        const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;
    
        const products = productsArray.reduce((parsed, product) => {
            const [
                bn_id,
                bn_minDisbursedAmount,
                bn_term,
                bn_discountRate,
                bn_collateralRatio,
                bn_defaultingFeePt,
                bn_isActive
            ] = product;
    
            if (bn_term.gt(0)) {
                const term = bn_term.toNumber();
                parsed.push({
                    id: bn_id.toNumber(),
                    term,
                    termText: moment.duration(term, "seconds").humanize(), // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
                    bn_discountRate,
                    discountRate: bn_discountRate / ppmDiv,
                    bn_collateralRatio,
                    collateralRatio: bn_collateralRatio / ppmDiv,
                    minDisbursedAmountInToken: bn_minDisbursedAmount / decimalsDiv,
                    bn_defaultingFeePt,
                    defaultingFeePt: bn_defaultingFeePt / ppmDiv,
                    isActive: bn_isActive.eq(1) ? true : false
                });
            }
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
    