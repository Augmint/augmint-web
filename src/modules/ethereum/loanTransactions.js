/*
Loan ethereum functions
Use only from reducers.
    TODO: tune default gasPrice
    TODO: clean up thrown errors
    TODO: set gasEstimates when it gas consumption has settled.
 */
import store from "modules/store";
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
    const weiAmount = ethAmount * ONE_ETH;

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
    try {
        const loanManager = store.getState().loanManager.contract.instance;
        const productCount = await loanManager.getProductCount();
        const ppmDiv = 1000000;
        const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

        // TODO: create a helper in LoanManager to get products in chunks
        let products = [];
        for (let i = 0; i < productCount; i++) {
            const p = await loanManager.products(i);
            const term = p[0].toNumber();
            // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
            const bn_discountRate = p[1];
            const bn_loanCollateralRatio = p[2];
            const bn_minDisbursedAmountInToken = p[3];
            const bn_defaultingFeePt = p[4];
            const isActive = p[5];

            const prod = {
                id: i,
                term,
                termText: moment.duration(term, "seconds").humanize(), // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
                bn_discountRate,
                discountRate: bn_discountRate / ppmDiv,
                bn_loanCollateralRatio,
                loanCollateralRatio: bn_loanCollateralRatio / ppmDiv,
                minDisbursedAmountInToken: bn_minDisbursedAmountInToken / decimalsDiv,
                bn_defaultingFeePt,
                defaultingFeePt: bn_defaultingFeePt / ppmDiv,
                isActive
            };
            products.push(prod);
        }
        return products;
    } catch (error) {
        throw new Error("fetchProductsTx failed.\n" + error);
    }
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
        repaymentAmount * decimalsDiv,
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
        const loanCount = (await loanManager.getLoanCount()).toNumber();

        let loansToCollect = [];
        for (let i = 0; i < loanCount; i++) {
            const loan = await fetchLoanDetails(i);
            if (loan.loanState === 21) {
                loansToCollect.push(loan);
            }
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

    const loanIdsToCollect = loansToCollect.map(item => item.loanId);

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

export async function fetchLoanDetails(_loanId) {
    // we call with number or BigNumber loanId
    const loanId = parseFloat(_loanId);
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;
    const loanManager = store.getState().loanManager.contract.instance;

    const l = await loanManager.loans(loanId);
    const [
        borrower,
        bn_solidityLoanState,
        bn_collateralAmount,
        bn_repaymentAmount,
        bn_loanAmount,
        bn_interestAmount,
        bn_term,
        bn_disbursementDate,
        bn_maturity
    ] = l;

    const solidityLoanState = bn_solidityLoanState.toNumber();
    const maturity = bn_maturity.toNumber();
    const term = bn_term.toNumber();
    const disbursementDate = bn_disbursementDate.toNumber();

    let loanStateText;
    const currentTime = moment()
        .utc()
        .unix();
    let loanState = null;
    let isDue = false;
    let isRepayable = false;
    let isCollectable = false;
    switch (solidityLoanState) {
        case 0:
            if (maturity < currentTime) {
                loanState = 21;
                isCollectable = true;
                loanStateText = "Defaulted (not yet collected)";
            } else if (maturity - currentTime < 24 * 60 * 60 * 2) {
                /* consider it due 2 days before */
                isDue = true;
                isRepayable = true;
                loanStateText = "Payment Due";
                loanState = 5;
            } else {
                isRepayable = true;
                loanState = 0;
                loanStateText = "Open";
            }
            break;
        case 1:
            loanState = 10;
            loanStateText = "Repaid";
            break;
        case 2:
            loanState = 20;
            loanStateText = "Defaulted";
            break;
        default:
            loanStateText = "Invalid state";
    }
    // TODO: refresh this reguraly? maybe move this to a state and add a timer?

    const loan = {
        loanId,
        borrower,
        loanState,
        solidityLoanState,
        loanStateText,
        collateralEth: bn_collateralAmount / ONE_ETH,
        repaymentAmount: bn_repaymentAmount / decimalsDiv,
        loanAmount: bn_loanAmount / decimalsDiv,
        interestAmount: bn_interestAmount / decimalsDiv,
        term,
        termText: moment.duration(term, "seconds").humanize(),
        disbursementDate,
        disbursementDateText: moment.unix(disbursementDate).format("D MMM YYYY HH:mm:ss"),
        maturity,
        maturityText: moment.unix(maturity).format("D MMM YYYY HH:mm"),
        isDue,
        isRepayable,
        isCollectable
    };
    return loan;
}
