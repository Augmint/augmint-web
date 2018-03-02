/* Loan ethereum functions
    Use only from reducers.  */
import store from "modules/store";
import BigNumber from "bignumber.js";
import moment from "moment";
import { cost } from "./gas";
import { EthereumTransactionError } from "modules/ethereum/ethHelper";

const ONE_ETH = 1000000000000000000;

export async function newEthBackedLoanTx(productId, ethAmount) {
    const web3 = store.getState().web3Connect.web3Instance;
    const loanManager = store.getState().loanManager.contract.instance;
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    let gasEstimate;
    if (store.getState().loanManager.info.loanCount === 0) {
        gasEstimate = cost.NEW_FIRST_LOAN_GAS;
    } else {
        gasEstimate = cost.NEW_LOAN_GAS;
    }

    const userAccount = store.getState().web3Connect.userAccount;
    const weiAmount = new BigNumber(ethAmount).mul(ONE_ETH);

    const result = await loanManager.newEthBackedLoan(productId, {
        value: weiAmount,
        from: userAccount,
        gas: gasEstimate
    });

    if (result.receipt.gasUsed === gasEstimate) {
        // Neeed for testnet behaviour (TODO: test it!)
        throw new EthereumTransactionError(
            "Create loan transaction failed.",
            "All gas provided was used. Check tx.",
            result,
            gasEstimate
        );
    }

    // should we get byzantium tx status? if so then how?
    // if (result.status !== 1) {
    //     throw new Error(...);
    // }

    if (!result.logs || !result.logs[0] || result.logs[0].event !== "NewLoan") {
        throw new EthereumTransactionError(
            "Create loan transaction failed.",
            "NewLoan event wasn't received. Check tx.",
            result,
            gasEstimate
        );
    }

    return {
        loanId: result.logs[0].args.loanId.toString(),
        productId: result.logs[0].args.productId.toNumber(),
        borrower: result.logs[0].args.borrower,
        loanAmount: result.logs[0].args.loanAmount.div(decimalsDiv).toNumber(),
        repaymentAmount: result.logs[0].args.repaymentAmount.div(decimalsDiv).toNumber(),
        collateralEth: web3.utils.fromWei(result.logs[0].args.collateralAmount.toString()),
        eth: {
            gasEstimate,
            result
        }
    };
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

export async function repayLoanTx(repaymentAmount, loanId) {
    const gasEstimate = cost.REPAY_GAS;

    const userAccount = store.getState().web3Connect.userAccount;
    const loanManager = store.getState().loanManager.contract.instance;

    const augmintToken = store.getState().augmintToken;
    const augmintTokenInstance = augmintToken.contract.instance;
    const decimalsDiv = augmintToken.info.decimalsDiv;

    const result = await augmintTokenInstance.transferAndNotify(
        loanManager.address,
        new BigNumber(repaymentAmount).mul(decimalsDiv).toString(),
        loanId,
        {
            from: userAccount,
            gas: gasEstimate
        }
    );

    if (result.receipt.gasUsed === gasEstimate) {
        // Neeed for testnet behaviour (TODO: test it!)
        throw new EthereumTransactionError(
            "Repay loan failed.",
            "All gas provided was used. Check tx.",
            result,
            gasEstimate
        );
    }
    if (
        !result.logs ||
        !result.logs[5] ||
        result.logs[5].event !== "AugmintTransfer" ||
        result.logs[5].args.to !== "0x0000000000000000000000000000000000000000"
    ) {
        // TODO: web3 doesn't return LoanRepayed on testrpc, so we test only for TokenBurned
        throw new EthereumTransactionError(
            "Repay loan failed.",
            "AugmintTransfer to 0x0 (burn) event wasn't received. Check tx.",
            result,
            gasEstimate
        );
    }

    return {
        eth: {
            gasEstimate,
            result
        }
    };
}

export async function fetchLoansToCollectTx() {
    try {
        const loanManager = store.getState().loanManager.contract.instance;
        // TODO: resolve timing of loanManager refresh in order to get chunkSize & loanCount from loanManager:
        const [chunkSize, loanCount] = await Promise.all([
            loanManager.CHUNK_SIZE().then(res => res.toNumber()),
            loanManager.getLoanCount().then(res => res.toNumber())
        ]);
        // const chunkSize = store.getState().loanManager.info.chunkSize;
        // const loanCount = await loanManager.getLoanCount();

        let loansToCollect = [];

        const queryCount = Math.ceil(loanCount / chunkSize);
        for (let i = 0; i < queryCount; i++) {
            const loansArray = await loanManager.getLoans(i * chunkSize);
            const defaultedLoans = parseLoans(loansArray).filter(loan => loan.isCollectable);
            loansToCollect = loansToCollect.concat(defaultedLoans);
        }

        return loansToCollect;
    } catch (error) {
        throw new Error("fetchLoansToCollectTx failed.\n" + error);
    }
}

// loansToCollect is an array : [{loanId: <loanId>}]
export async function collectLoansTx(loansToCollect) {
    const userAccount = store.getState().web3Connect.userAccount;
    const loanManager = store.getState().loanManager.contract.instance;
    const gasEstimate = cost.COLLECT_BASE_GAS + cost.COLLECT_ONE_GAS * loansToCollect.length;

    const loanIdsToCollect = loansToCollect.map(loan => loan.id);

    const result = await loanManager.collect(loanIdsToCollect, {
        from: userAccount,
        gas: gasEstimate
    });
    if (result.receipt.gasUsed === gasEstimate) {
        // Neeed for testnet behaviour (TODO: test it!)
        throw new EthereumTransactionError(
            "Loan collection error.",
            "All gas provided was used. Check tx.",
            result,
            gasEstimate
        );
    }
    if (!result.logs || result.logs.length === 0) {
        throw new EthereumTransactionError(
            "Loan collection error.",
            "No LoanCollected events received. Check tx",
            result,
            gasEstimate
        );
    }

    result.logs.map((logItem, index) => {
        if (!logItem.event || logItem.event !== "LoanCollected") {
            throw new EthereumTransactionError(
                "Likely not all loans has been collected",
                "One of the events received is not LoanCollected. Check tx.\n" +
                    `logs[${index}] received: ${logItem.event}.`,
                result,
                gasEstimate
            );
        }
        return true;
    });

    if (result.logs.length !== loansToCollect.length) {
        throw new EthereumTransactionError(
            "Likely not all loans has been collected.",
            "Number of LoanCollected events != loansToCollect passed. Check tx.\n" +
                `Received: ${result.logs.length} events. Expected: ${loansToCollect.length}`,
            result,
            gasEstimate
        );
    }

    return {
        loansCollected: loansToCollect.length,
        eth: {
            gasEstimate,
            result
        }
    };
}

export async function fetchLoansForAddressTx(account) {
    const loanManager = store.getState().loanManager.contract.instance;

    // TODO: resolve timing of loanManager refresh in order to get chunkSize & loanCount from loanManager:
    const [chunkSize, loanCount] = await Promise.all([
        loanManager.CHUNK_SIZE().then(res => res.toNumber()),
        loanManager.getLoanCountForAddress(account).then(res => res.toNumber())
    ]);
    // const chunkSize = store.getState().loanManager.info.chunkSize;
    // const loanCount = await loanManager.getLoanCountForAddress(account);

    let loans = [];

    const queryCount = Math.ceil(loanCount / chunkSize);

    for (let i = 0; i < queryCount; i++) {
        const loansArray = await loanManager.getLoansForAddress(account, i * chunkSize);
        loans = loans.concat(parseLoans(loansArray));
    }

    return loans;
}

function parseLoans(loansArray) {
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

    const loans = loansArray.reduce((parsed, loan) => {
        const [
            bn_id,
            bn_collateralAmount,
            bn_repaymentAmount,
            borrower,
            bn_productId,
            bn_state,
            bn_maturity,
            bn_disbursementTime,
            bn_loanAmount,
            bn_interestAmount
        ] = loan;

        if (bn_maturity.gt(0)) {
            const currentTime = moment()
                .utc()
                .unix();
            const disbursementTime = bn_disbursementTime.toNumber();
            const term = bn_maturity.sub(bn_disbursementTime).toNumber();
            const maturity = bn_maturity.toNumber();
            let loanStateText = null;
            let isDue = false;
            let isRepayable = false;
            let isCollectable = false;

            const state = bn_state.toNumber();
            switch (state) {
                case 0:
                    if (maturity - currentTime < 24 * 60 * 60 * 2) {
                        /* consider it due 2 days before */
                        isDue = true;
                        isRepayable = true;
                        loanStateText = "Payment Due";
                    } else {
                        isRepayable = true;
                        loanStateText = "Open";
                    }
                    break;
                case 1:
                    loanStateText = "Repaid";
                    break;
                case 2:
                    isCollectable = true;
                    loanStateText = "Defaulted (not yet collected)";
                    break;
                case 3:
                    loanStateText = "Defaulted and collected";
                    break;
                default:
                    loanStateText = "Invalid state";
            }

            parsed.push({
                id: bn_id.toNumber(),
                borrower: "0x" + borrower.toString(16),
                productId: bn_productId.toNumber(),
                state,
                loanStateText,
                collateralEth: bn_collateralAmount / ONE_ETH,
                repaymentAmount: bn_repaymentAmount / decimalsDiv,
                loanAmount: bn_loanAmount / decimalsDiv,
                interestAmount: bn_interestAmount / decimalsDiv,
                term,
                termText: moment.duration(term, "seconds").humanize(),
                disbursementTime,
                disbursementTimeText: moment.unix(disbursementTime).format("D MMM YYYY HH:mm:ss"),
                maturity,
                maturityText: moment.unix(maturity).format("D MMM YYYY HH:mm"),
                isDue,
                isRepayable,
                isCollectable
            });
        }

        return parsed;
    }, []);

    return loans;
}
