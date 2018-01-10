/*
Loan ethereum functions
Use only from reducers.
    TODO: tune default gasPrice
    TODO: clean up thrown errors
    TODO: set gasEstimates when it gas consumption has settled.
 */
import store from "modules/store";
import BigNumber from "bignumber.js";
import moment from "moment";
import stringifier from "stringifier";
import { cost } from "./gas";

const stringify = stringifier({ maxDepth: 5, indent: "   " });

export async function newEthBackedLoanTx(productId, ethAmount) {
    try {
        const web3 = store.getState().web3Connect.web3Instance;
        const loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate;
        if (store.getState().loanManager.info.loanCount === 0) {
            gasEstimate = cost.NEW_FIRST_LOAN_GAS;
        } else {
            gasEstimate = cost.NEW_LOAN_GAS;
        }
        const userAccount = store.getState().web3Connect.userAccount;
        const weiAmount = web3.utils.toWei(ethAmount);
        const result = await loanManager.newEthBackedLoan(productId, {
            value: weiAmount,
            from: userAccount,
            gas: gasEstimate
        });

        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("All gas provided was used:  " + result.receipt.gasUsed);
        }

        if (!result.logs || !result.logs[0] || result.logs[0].event !== "NewLoan") {
            throw new Error("NewLoan event wasn't received. Check tx :  " + result.tx);
        }
        return {
            txResult: result,
            loanId: result.logs[0].args.loanId.toString(),
            productId: result.logs[0].args.productId.toNumber(),
            borrower: result.logs[0].args.borrower,
            loanAmount: result.logs[0].args.loanAmount.div(new BigNumber(10000)).toNumber(),
            repaymentAmount: result.logs[0].args.repaymentAmount.div(new BigNumber(10000)).toNumber(),
            collateralEth: web3.utils.fromWei(result.logs[0].args.collateralAmount.toString()),
            eth: {
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        throw new Error("Create loan failed.\n" + error);
    }
}

export async function fetchProductsTx() {
    try {
        const loanManager = store.getState().loanManager.contract.instance;
        const productCount = await loanManager.getProductCount();
        // TODO: get this from store.augmintToken (timing issues on first load..)
        const decimalsDiv = new BigNumber(10).pow(await store.getState().augmintToken.contract.instance.decimals());

        let products = [];
        for (let i = 0; i < productCount; i++) {
            const p = await loanManager.products(i);
            const term = p[0].toNumber();
            // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
            const bn_discountRate = p[1].div(new BigNumber(1000000));
            const bn_loanCollateralRatio = p[2].div(new BigNumber(1000000));
            const bn_minDisbursedAmountInToken = p[3];
            const bn_defaultingFeePt = p[4].div(new BigNumber(1000000));
            const prod = {
                id: i,
                term: term,
                termText: moment.duration(term, "seconds").humanize(),
                bn_discountRate: bn_discountRate,
                discountRate: bn_discountRate.toNumber(),
                bn_loanCollateralRatio: bn_loanCollateralRatio,
                loanCollateralRatio: bn_loanCollateralRatio.toNumber(),
                bn_minDisbursedAmountInToken: bn_minDisbursedAmountInToken,
                minDisbursedAmountInToken: bn_minDisbursedAmountInToken.div(decimalsDiv).toNumber(),
                bn_defaultingFeePt: bn_defaultingFeePt,
                defaultingFeePt: bn_defaultingFeePt.toNumber(),
                isActive: p[5]
            };
            products.push(prod);
        }
        return products;
    } catch (error) {
        throw new Error("fetchProductsTx failed.\n" + error);
    }
}

export async function repayLoanTx(loanId) {
    try {
        const userAccount = store.getState().web3Connect.userAccount;
        const loanManager = store.getState().loanManager.contract.instance;
        const augmintToken = store.getState().augmintToken.contract.instance;
        const gasEstimate = cost.REPAY_GAS;
        let result = await augmintToken.repayLoan(loanManager.address, loanId, {
            from: userAccount,
            gas: gasEstimate
        });
        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("All gas provided was used:  " + result.receipt.gasUsed);
        }
        if (!result.logs || !result.logs[3] || result.logs[3].event !== "TokenBurned") {
            // TODO: web3 doesn't return last event (LoanRepayed) on testrpc, so we test only for TokenBurned
            throw new Error(
                "TokenBurned event wasn't received. Check tx :  " + result.tx + "\nResult:\n" + stringify(result)
            );
        }

        return {
            txResult: result,
            eth: {
                // TODO:  make it mre generic for all txs
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        // TODO: return eth { tx: ...} so that EthSubmissionErrorPanel can display it
        throw new Error("Repay loan failed.\n" + error);
    }
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

export async function collectLoansTx(loansToCollect) {
    try {
        const userAccount = store.getState().web3Connect.userAccount;
        const loanManager = store.getState().loanManager.contract.instance;
        const gasEstimate = cost.COLLECT_BASE_GAS + cost.COLLECT_ONE_GAS * loansToCollect.length;
        const converted = loansToCollect.map(item => {
            return new BigNumber(item.loanId);
        });
        const result = await loanManager.collect(converted, {
            from: userAccount,
            gas: gasEstimate
        });
        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error("All gas provided was used:  " + result.receipt.gasUsed);
        }
        if (!result.logs || result.logs.length === 0) {
            throw new Error("no LoanCollected events received. Check tx :  " + result.tx);
        }

        result.logs.map((logItem, index) => {
            if (!logItem.event || logItem.event !== "LoanCollected") {
                throw new Error(
                    "Likely not all loans has been collected.\n" +
                        "One of the events received is not LoanCollected.\n" +
                        "logs[" +
                        index +
                        "] received: " +
                        logItem.event +
                        "\n" +
                        "Check tx :  " +
                        result.tx
                );
            }
            return true;
        });

        if (result.logs.length !== loansToCollect.length) {
            throw new Error(
                "Likely not all loans has been collected.\n" +
                    "Number of LoanCollected events != loansToCollect passed.\n" +
                    "Received: " +
                    result.logs.length +
                    " events. Expected: " +
                    loansToCollect.length +
                    "\n" +
                    "Check tx :  " +
                    result.tx
            );
        }

        return {
            loansCollected: loansToCollect.length,
            txResult: result,
            eth: {
                // TODO:  make it mre generic for all txs
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        // TODO: return eth { tx: ...} so that EthSubmissionErrorPanel can display it
        throw new Error("Collect loan failed.\n" + error);
    }
}

export async function fetchLoanDetails(_loanId) {
    const web3 = store.getState().web3Connect.web3Instance;
    const loanManager = store.getState().loanManager.contract.instance;
    const loanId = _loanId.toString(); // we call with number or w/ BigNumber
    const l = await loanManager.loans(loanId);
    const solidityLoanState = l[1].toNumber();
    let loanStateText;
    const maturity = l[8].toNumber();
    const maturityText = moment.unix(maturity).format("D MMM YYYY HH:mm");
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

    const disbursementDate = l[7].toNumber();
    const disbursementDateText = moment.unix(disbursementDate).format("D MMM YYYY HH:mm:ss");
    const loan = {
        loanId: loanId,
        borrower: l[0], // 0 the borrower
        loanState: loanState,
        solidityLoanState: solidityLoanState,
        loanStateText: loanStateText,
        collateralEth: web3.utils.fromWei(l[2].toString()),
        repaymentAmount: l[3].toNumber() / 10000, // 4 nominal loan amount in ACE (non discounted amount)
        loanAmount: l[4].toNumber() / 10000, // 5
        interestAmount: l[5].toNumber / 10000,
        term: l[6].toNumber(), // 6 duration of loan
        termText: moment.duration(l[6].toNumber(), "seconds").humanize(),
        disbursementDate: disbursementDate,
        disbursementDateText: disbursementDateText,
        maturity: maturity,
        maturityText: maturityText,
        isDue: isDue,
        isRepayable: isRepayable,
        isCollectable: isCollectable
    };
    return loan;
}
