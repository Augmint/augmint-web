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
        const ppmDiv = 1000000;
        const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;

        // TODO: create a helper in LoanManager to get products in chunks
        let products = [];
        for (let i = 0; i < productCount; i++) {
            const p = await loanManager.products(i);
            const term = p.term.toNumber();
            const prod = {
                id: i,
                term,
                termText: moment.duration(term, "seconds").humanize(), // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
                discountRate: p.discountRate / ppmDiv,
                loanCollateralRatio: p.collateralRatio / ppmDiv,
                minDisbursedAmountInToken: p.minDisbursedAmount / decimalsDiv,
                defaultingFeePt: p.defaultingFeePt / ppmDiv,
                isActive: p.isActive
            };
            products.push(prod);
        }
        return products;
    } catch (error) {
        throw new Error("fetchProductsTx failed.\n" + error);
    }
}

export async function repayLoanTx(repaymentAmount, loanId) {
    try {
        const userAccount = store.getState().web3Connect.userAccount;
        const loanManager = store.getState().loanManager.contract.instance;

        const augmintToken = store.getState().augmintToken;
        const augmintTokenInstance = augmintToken.contract.instance;
        const decimalsDiv = augmintToken.info.decimalsDiv;
        const gasEstimate = cost.REPAY_GAS;

        let result = await augmintTokenInstance.transferAndNotify(
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
            // TODO: add more tx info
            throw new Error("All gas provided was used:  " + result.receipt.gasUsed);
        }
        if (
            !result.logs ||
            !result.logs[5] ||
            result.logs[5].event !== "AugmintTransfer" ||
            result.logs[5].args.to !== "0x0000000000000000000000000000000000000000"
        ) {
            // TODO: web3 doesn't return LoanRepayed on testrpc, so we test only for TokenBurned
            throw new Error(
                "AugmintTransfer to 0x0 (burn) event wasn't received. Check tx :  " +
                    result.tx +
                    "\nResult:\n" +
                    stringify(result)
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
        const loanCount = (await loanManager.getLoanCount()).ct;

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
    const loanId = _loanId.toString(); // we call with number or w/ BigNumber
    const ONE_ETH = 1000000000000000000;
    const decimalsDiv = store.getState().augmintToken.info.decimalsDiv;
    const loanManager = store.getState().loanManager.contract.instance;

    const l = await loanManager.loans(loanId);
    const solidityLoanState = l.state;
    let loanStateText;
    const maturity = l.maturity.toNumber();
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

    const disbursementDate = l.disbursementDate.toNumber();
    const disbursementDateText = moment.unix(disbursementDate).format("D MMM YYYY HH:mm:ss");
    const loan = {
        loanId: Number(loanId),
        borrower: l.borrower, // 0 the borrower
        loanState: loanState,
        solidityLoanState: solidityLoanState,
        loanStateText: loanStateText,
        collateralEth: l.collateralAmount / ONE_ETH,
        repaymentAmount: l.repaymentAmount / decimalsDiv, // 4 nominal loan amount in A-EUR (non discounted amount)
        loanAmount: l.loanAmount / decimalsDiv, // 4
        interestAmount: l.interestAmount / decimalsDiv, // 5
        term: l.term.toNumber(), // 6 duration of loan
        termText: moment.duration(l.term.toNumber(), "seconds").humanize(),
        disbursementDate,
        disbursementDateText,
        maturity,
        maturityText,
        isDue,
        isRepayable,
        isCollectable
    };
    return loan;
}
