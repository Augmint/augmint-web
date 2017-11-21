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
import ethBackedLoan_artifacts from "contractsBuild/EthBackedLoan.json";
import SolidityContract from "modules/ethereum/SolidityContract";
import { asyncGetBalance, getUcdBalance } from "modules/ethereum/ethHelper";
import { cost } from "./gas";

const stringify = stringifier({ maxDepth: 5, indent: "   " });

export async function newEthBackedLoanTx(productId, ethAmount) {
    try {
        let web3 = store.getState().web3Connect.web3Instance;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate;
        if (store.getState().loanManager.loanCount === 0) {
            gasEstimate = cost.NEW_FIRST_LOAN_GAS;
        } else {
            gasEstimate = cost.NEW_LOAN_GAS;
        }
        let userAccount = store.getState().web3Connect.userAccount;
        let weiAmount = web3.utils.toWei(ethAmount);
        let result = await loanManager.newEthBackedLoan(productId, {
            value: weiAmount,
            from: userAccount,
            gas: gasEstimate
        });

        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error(
                "All gas provided was used:  " + result.receipt.gasUsed
            );
        }

        if (
            !result.logs ||
            !result.logs[0] ||
            result.logs[0].event !== "e_newLoan"
        ) {
            throw new Error(
                "e_newLoan wasn't event received. Check tx :  " + result.tx
            );
        }
        return {
            txResult: result,
            address: result.logs[0].args.loanContract,
            loanId: result.logs[0].args.loanId.toNumber(),
            productId: result.logs[0].args.productId.toNumber(),
            borrower: result.logs[0].args.borrower,
            disbursedLoanInUcd: result.logs[0].args.disbursedLoanInUcd
                .div(new BigNumber(10000))
                .toNumber(),
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
        let loanManager = store.getState().loanManager.contract.instance;
        let productCount = await loanManager.getProductCount();
        // TODO: get this from store.tokenUcd (timing issues on first load..)
        let decimalsDiv = new BigNumber(10).pow(
            await store.getState().tokenUcd.contract.instance.decimals()
        );

        let products = [];
        for (let i = 0; i < productCount; i++) {
            let p = await loanManager.products(i);
            let term = p[0].toNumber();
            // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
            let repayPeriod = p[4].toNumber();
            let bn_discountRate = p[1].div(new BigNumber(1000000));
            let bn_loanCollateralRatio = p[2].div(new BigNumber(1000000));
            let bn_minDisbursedAmountInUcd = p[3];
            let prod = {
                id: i,
                term: term,
                termText: moment.duration(term, "seconds").humanize(),
                bn_discountRate: bn_discountRate,
                discountRate: bn_discountRate.toNumber(),
                bn_loanCollateralRatio: bn_loanCollateralRatio,
                loanCollateralRatio: bn_loanCollateralRatio.toNumber(),
                bn_minDisbursedAmountInUcd: bn_minDisbursedAmountInUcd,
                minDisbursedAmountInUcd: bn_minDisbursedAmountInUcd
                    .div(decimalsDiv)
                    .toNumber(),
                repayPeriod: repayPeriod,
                repayPeriodText: moment
                    .duration(repayPeriod, "seconds")
                    .humanize(),
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
        let userAccount = store.getState().web3Connect.userAccount;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate = cost.REPAY_GAS;
        let result = await loanManager.repay(loanId, {
            from: userAccount,
            gas: gasEstimate
        });
        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error(
                "All gas provided was used:  " + result.receipt.gasUsed
            );
        }
        if (
            !result.logs ||
            !result.logs[0] ||
            result.logs[0].event !== "e_repayed"
        ) {
            // TODO: check and handle e_error event errocodes in user friendly way:
            //         -12 ( tokenUcd.ERR_UCD_BALANCE_NOT_ENOUGH + loanManager.ERR_EXT_ERRCODE_BASE)
            //          myabe: loanManager.ERR_LOAN_NOT_OPEN and loanManager.ERR_NOT_OWNER too
            throw new Error(
                "e_repayed wasn't event received. Check tx :  " +
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
        let loanManager = store.getState().loanManager.contract.instance;
        let loanCount = (await loanManager.getLoanCount()).toNumber();
        let loansToCollect = [];
        for (let i = 0; i < loanCount; i++) {
            let loanManagerContractTuple = await loanManager.loanPointers(i);
            let loanState = loanManagerContractTuple[1].toNumber();
            if (loanState === 0) {
                // TODO: get enum from contract
                let loanContractAddress = loanManagerContractTuple[0];
                let loan = await fetchLoanDetailsByAddress(loanContractAddress);
                if (loan.loanState === 21) {
                    loansToCollect.push(loan);
                }
            }
        }
        return loansToCollect;
    } catch (error) {
        throw new Error("fetchLoansToCollectTx failed.\n" + error);
    }
}

export async function collectLoansTx(loansToCollect) {
    try {
        let userAccount = store.getState().web3Connect.userAccount;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate = cost.COLLECT_GAS; // TODO: calculate BASE + gasperloan x N
        let converted = loansToCollect.map(item => {
            return new BigNumber(item.loanId);
        });
        let result = await loanManager.collect(converted, {
            from: userAccount,
            gas: gasEstimate
        });
        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error(
                "All gas provided was used:  " + result.receipt.gasUsed
            );
        }
        if (!result.logs || result.logs.length === 0) {
            throw new Error(
                "no e_collected events received. Check tx :  " + result.tx
            );
        }

        result.logs.map((logItem, index) => {
            if (!logItem.event || logItem.event !== "e_collected") {
                throw new Error(
                    "Likely not all loans has been collected.\n" +
                        "One of the events received is not e_collected.\n" +
                        "logs[" +
                        index +
                        "] received: " +
                        logItem +
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
                    "Number of e_collected events != loansToCollect passed.\n" +
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

export async function fetchLoanDetails(loanId) {
    let loanManager = store.getState().loanManager.contract.instance;
    let res = await loanManager.loanPointers(loanId);
    let loanContractAddress = res[0];
    return fetchLoanDetailsByAddress(loanContractAddress);
}

export async function fetchLoanDetailsByAddress(loanContractAddress) {
    let bn_ethBalance = await asyncGetBalance(loanContractAddress);
    let bn_ucdBalance = await getUcdBalance(loanContractAddress);

    let loanContract = await SolidityContract.connectNewAt(
        store.getState().web3Connect.web3Instance,
        ethBackedLoan_artifacts,
        loanContractAddress
    );
    let l = await loanContract.instance.getDetails(); // tuple with loan details
    let solidityLoanState = l[3].toNumber();
    let loanStateText;
    let maturity = l[8].toNumber();
    let maturityText = moment.unix(maturity).format("D MMM YYYY HH:mm");
    let repayPeriod = l[9].toNumber();
    let repayBy = repayPeriod + maturity;
    let currentTime = moment()
        .utc()
        .unix();
    let loanState = null;
    let isDue = false;
    switch (solidityLoanState) {
        case 0:
            if (repayBy < currentTime) {
                loanState = 21;
                loanStateText = "Defaulted (not yet collected)";
            } else if (maturity < currentTime && repayBy > currentTime) {
                isDue = true;
                loanStateText = "Payment Due";
                loanState = 5;
            } else {
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

    let disbursementDate = l[7].toNumber();
    let disbursementDateText = moment
        .unix(disbursementDate)
        .format("D MMM YYYY HH:mm:ss");
    let loan = {
        ethBalance: bn_ethBalance.toNumber(),
        ucdBalance: bn_ucdBalance.toNumber(),
        loanId: l[10].toNumber(),
        loanContract: loanContract,
        borrower: l[0], // 0 the borrower
        loanManagerAddress: l[1], // 1 loan manager contract instance
        tokenUcdAddress: l[2], // 2 tokenUcd instance
        loanState: loanState, // 3
        solidityLoanState: solidityLoanState,
        loanStateText: loanStateText,
        ucdDueAtMaturity: l[4].toNumber() / 10000, // 4 nominal loan amount in ACD (non discounted amount)
        disbursedLoanInUcd: l[5].toNumber() / 10000, // 5
        term: l[6].toNumber(), // 6 duration of loan
        termText: moment.duration(l[6].toNumber(), "seconds").humanize(),
        disbursementDate: disbursementDate,
        disbursementDateText: disbursementDateText, // 7
        maturity: maturity, // 8 disbursementDate + term
        maturityText: maturityText,
        repayPeriod: repayPeriod, // 9
        repayPeriodText: moment.duration(repayPeriod, "seconds").humanize(),
        repayBy: repayBy,
        repayByText: moment
            .unix(repayPeriod + maturity)
            .format("D MMM YYYY HH:mm"),
        isDue: isDue
    };
    return loan;
}
