/* Loan ethereum functions
    Use only from reducers.  */
import store from "modules/store";
import BigNumber from "bignumber.js";
import moment from "moment";
import { cost } from "./gas";
import { EthereumTransactionError, processTx } from "modules/ethereum/ethHelper";
import SolidityContract from "modules/ethereum/SolidityContract";
import { ONE_ETH_IN_WEI, DECIMALS_DIV, PPM_DIV } from "../../utils/constants";

export async function newEthBackedLoanTx(productId, ethAmount) {
    const loanManagerInstance = store.getState().contracts.latest.loanManager.web3ContractInstance;
    const txName = "New loan";

    let gasEstimate;
    if (store.getState().loanManager.info.loanCount === 0) {
        gasEstimate = cost.NEW_FIRST_LOAN_GAS;
    } else {
        gasEstimate = cost.NEW_LOAN_GAS;
    }

    const userAccount = store.getState().web3Connect.userAccount;
    const weiAmount = new BigNumber(ethAmount).mul(ONE_ETH_IN_WEI);

    const tx = loanManagerInstance.methods
        .newEthBackedLoan(productId)
        .send({ value: weiAmount, from: userAccount, gas: gasEstimate });

    const transactionHash = await processTx(tx, txName, gasEstimate);
    return { txName, transactionHash };
}

export async function fetchProductsTx() {
    const loanManagerInstance = store.getState().contracts.latest.loanManager.web3ContractInstance;

    // TODO: resolve timing of loanManager refresh in order to get chunkSize & productCount from loanManager:
    const [chunkSize, productCount] = await Promise.all([
        loanManagerInstance.methods
            .CHUNK_SIZE()
            .call()
            .then(res => parseInt(res, 10)),
        loanManagerInstance.methods
            .getProductCount()
            .call()
            .then(res => parseInt(res, 10))
    ]);
    // const chunkSize = store.getState().loanManager.info.chunkSize;
    // const productCount = store.getState().loanManager.info.productCount;

    let products = [];

    const queryCount = Math.ceil(productCount / chunkSize);

    for (let i = 0; i < queryCount; i++) {
        const productsArray = await loanManagerInstance.methods.getProducts(i * chunkSize).call();
        const parsedProducts = parseProducts(productsArray);
        products = products.concat(parsedProducts);
    }

    return products;
}

function parseProducts(productsArray) {
    const products = productsArray.reduce((parsed, product) => {
        const [
            bn_id,
            bn_minDisbursedAmount,
            bn_term,
            bn_discountRate,
            bn_collateralRatio,
            bn_defaultingFeePt,
            bn_maxLoanAmount,
            bn_isActive
        ] = product;

        const termInSecs = parseInt(bn_term, 10);
        const termInDays = termInSecs / 60 / 60 / 24;
        const discountRate = bn_discountRate / PPM_DIV;
        const interestRatePa = ((1 / discountRate - 1) / termInDays) * 365;
        if (termInSecs > 0) {
            parsed.push({
                id: parseInt(bn_id, 10),
                termInSecs,
                termInDays,
                termText: moment.duration(termInSecs, "seconds").humanize(), // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
                bn_discountRate,
                interestRatePa,
                discountRate,
                bn_collateralRatio,
                collateralRatio: bn_collateralRatio / PPM_DIV,
                minDisbursedAmountInToken: bn_minDisbursedAmount / DECIMALS_DIV * 1.1,
                maxLoanAmount: bn_maxLoanAmount / DECIMALS_DIV,
                bn_defaultingFeePt,
                defaultingFeePt: bn_defaultingFeePt / PPM_DIV,
                isActive: bn_isActive === "1"
            });
        }
        return parsed;
    }, []);

    return products;
}

export async function repayLoanTx(loanManagerInstance, repaymentAmount, loanId) {
    const txName = "Repay loan";
    const gasEstimate = cost.REPAY_GAS;

    const userAccount = store.getState().web3Connect.userAccount;

    let augmintTokenInstance;
    if (loanManagerInstance._address !== store.getState().contracts.latest.loanManager.address) {
        // repayment of a legacy loan, need to fetch which augmintToken is it
        const augmintTokenAddress = await loanManagerInstance.methods.augmintToken().call();
        const web3 = store.getState().web3Connect;
        augmintTokenInstance = SolidityContract.connectAt(web3, "TokenAEur", augmintTokenAddress).web3ContractInstance;
    } else {
        augmintTokenInstance = store.getState().contracts.latest.augmintToken.web3ContractInstance;
    }

    const tx = augmintTokenInstance.methods
        .transferAndNotify(
            loanManagerInstance._address,
            new BigNumber(repaymentAmount).mul(DECIMALS_DIV).toString(),
            loanId
        )
        .send({ from: userAccount, gas: gasEstimate });

    const onReceipt = receipt => {
        // loan repayment called on AugmintToken and web3 is not parsing event emmitted from LoanManager
        const web3 = store.getState().web3Connect.web3Instance;
        const loanRepayedEventInputs = loanManagerInstance.options.jsonInterface.find(val => val.name === "LoanRepayed")
            .inputs;

        const decodedArgs = web3.eth.abi.decodeLog(
            loanRepayedEventInputs,
            receipt.events[0].raw.data,
            receipt.events[0].raw.topics.slice(1) // topics[0] is event name
        );
        receipt.events.LoanRepayed = receipt.events[0];
        receipt.events.LoanRepayed.returnValues = decodedArgs;
        return { loanId: decodedArgs.loanId };
    };

    const transactionHash = await processTx(tx, txName, gasEstimate, onReceipt);
    return { txName, transactionHash };
}

export async function fetchLoansToCollectTx() {
    try {
        const loanManagerInstance = store.getState().contracts.latest.loanManager.web3ContractInstance;

        // TODO: resolve timing of loanManager refresh in order to get chunkSize & loanCount from loanManager:
        const [chunkSize, loanCount] = await Promise.all([
            loanManagerInstance.methods
                .CHUNK_SIZE()
                .call()
                .then(res => parseInt(res, 10)),
            loanManagerInstance.methods
                .getLoanCount()
                .call()
                .then(res => parseInt(res, 10))
        ]);
        // const chunkSize = store.getState().loanManager.info.chunkSize;
        // const loanCount = await loanManager.getLoanCount();

        let loansToCollect = [];

        const queryCount = Math.ceil(loanCount / chunkSize);
        for (let i = 0; i < queryCount; i++) {
            const loansArray = await loanManagerInstance.methods.getLoans(i * chunkSize).call();
            const defaultedLoans = parseLoans(loansArray).filter(loan => loan.isCollectable);
            loansToCollect = loansToCollect.concat(defaultedLoans);
        }

        return loansToCollect;
    } catch (error) {
        throw new Error("fetchLoansToCollectTx failed.\n" + error);
    }
}

// loansToCollect is an array : [{loanId: <loanId>}]
export async function collectLoansTx(loanManagerInstance, loansToCollect) {
    const txName = "Collect loan(s)";
    const userAccount = store.getState().web3Connect.userAccount;
    const gasEstimate = cost.COLLECT_BASE_GAS + cost.COLLECT_ONE_GAS * loansToCollect.length;

    const loanIdsToCollect = loansToCollect.map(loan => loan.id);

    const tx = loanManagerInstance.methods.collect(loanIdsToCollect).send({ from: userAccount, gas: gasEstimate });

    const onReceipt = receipt => {
        const loanCollectedEventsCount =
            typeof receipt.events.LoanCollected === "undefined"
                ? 0
                : Array.isArray(receipt.events.LoanCollected)
                    ? receipt.events.LoanCollected.length
                    : 1;

        if (loanCollectedEventsCount !== loansToCollect.length) {
            throw new EthereumTransactionError(
                "Likely not all loans has been collected.",
                "Number of LoanCollected events != loansToCollect passed. Check tx.\n" +
                    `Received: ${loanCollectedEventsCount} LoanCollected events. Expected: ${loansToCollect.length}`,
                receipt,
                gasEstimate
            );
        } else {
            return { loanCollectedEventsCount };
        }
    };
    const transactionHash = await processTx(tx, txName, gasEstimate, onReceipt);

    return { txName, transactionHash };
}

export async function fetchLoansForAddressTx(loanManagerInstance, account) {
    // TODO: resolve timing of loanManager refresh in order to get chunkSize & loanCount from loanManager:
    const [chunkSize, loanCount] = await Promise.all([
        loanManagerInstance.methods
            .CHUNK_SIZE()
            .call()
            .then(res => parseInt(res, 10)),
        loanManagerInstance.methods
            .getLoanCountForAddress(account)
            .call()
            .then(res => parseInt(res, 10))
    ]);
    // const chunkSize = store.getState().loanManager.info.chunkSize;
    // const loanCount = await loanManager.getLoanCountForAddress(account);

    let loans = [];

    const queryCount = Math.ceil(loanCount / chunkSize);

    for (let i = 0; i < queryCount; i++) {
        const loansArray = await loanManagerInstance.methods.getLoansForAddress(account, i * chunkSize).call();
        loans = loans.concat(parseLoans(loansArray));
    }

    return loans;
}

function parseLoans(loansArray) {
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

        const maturity = parseInt(bn_maturity, 10);
        if (maturity > 0) {
            const currentTime = moment()
                .utc()
                .unix();
            const disbursementTime = parseInt(bn_disbursementTime, 10);
            const term = maturity - disbursementTime;

            let loanStateText = null;
            let isDue = false;
            let isRepayable = false;
            let isCollectable = false;
            let collateralStatus;

            const state = parseInt(bn_state, 10);
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
                    collateralStatus = "in escrow";
                    break;
                case 1:
                    loanStateText = "Repaid";
                    collateralStatus = "released";
                    break;
                case 2:
                    isCollectable = true;
                    collateralStatus = "in escrow";
                    loanStateText = "Defaulted (not yet collected)";
                    break;
                case 3:
                    loanStateText = "Defaulted and collected";
                    collateralStatus = "collected & leftover refunded";
                    break;
                default:
                    loanStateText = "Invalid state";
            }

            parsed.push({
                id: parseInt(bn_id, 10),
                borrower: "0x" + new BigNumber(borrower).toString(16).padStart(40, "0"), // leading 0s if address starts with 0,
                productId: parseInt(bn_productId, 10),
                state,
                collateralStatus,
                loanStateText,
                collateralEth: bn_collateralAmount / ONE_ETH_IN_WEI,
                repaymentAmount: bn_repaymentAmount / DECIMALS_DIV,
                loanAmount: bn_loanAmount / DECIMALS_DIV,
                interestAmount: bn_interestAmount / DECIMALS_DIV,
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
