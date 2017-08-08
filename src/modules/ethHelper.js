/*
 TODO: gasPrice param
 */
import store from "store";
import BigNumber from "bignumber.js";
import { fetchLoanDetailsByAddress } from "modules/loans";
import moment from "moment";

// TODO: set gasEstimates when it settled.
const NEW_LOAN_GAS = 2000000; // As of now it's on testRPC: first= 762376  additional = 702376
const NEW_FIRST_LOAN_GAS = 2000000;
const REPAY_GAS = 200000;
const COLLECT_GAS = 300000;

export function asyncGetBalance(address) {
    return new Promise(function(resolve, reject) {
        let web3 = store.getState().ethBase.web3Instance;
        web3.eth.getBalance(address, function(error, bal) {
            if (error) {
                reject(error);
            } else {
                resolve(web3.fromWei(bal).toNumber());
            }
        });
    });
}

export function asyncGetNetwork(web3) {
    return new Promise(function(resolve, reject) {
        web3.version.getNetwork((error, networkId) => {
            if (error) {
                reject(error);
            } else {
                let networkName;
                switch (networkId) {
                    case "1":
                        networkName = "Main";
                        break;
                    case "2":
                        networkName = "Morden";
                        break;
                    case "3":
                        networkName = "Ropsten";
                        break;
                    case "4":
                        networkName = "Rinkeby";
                        break;
                    case "42":
                        networkName = "Kovan";
                        break;
                    case "999":
                        networkName = "Testrpc";
                        break;
                    default:
                        networkName = "Unknown";
                }
                resolve({ id: networkId, name: networkName });
            }
        });
    });
}

export async function getUcdBalance(address) {
    let tokenUcd = store.getState().tokenUcd;
    let balance = (await tokenUcd.contract.instance.balanceOf(
        address
    )).toNumber();
    let decimalsDiv = tokenUcd.decimalsDiv;
    if (tokenUcd.decimalsDiv === null || tokenUcd.decimalsDiv === "?") {
        // this is a workround for timing issue with tokenUcd refresh
        // TODO: figure out how to rearrange refresh to avoid these checks
        decimalsDiv =
            10 ** (await tokenUcd.contract.instance.decimals()).toNumber();
    }
    return balance / decimalsDiv;
}

export async function newEthBackedLoanTx(productId, ethAmount) {
    try {
        let web3 = store.getState().ethBase.web3Instance;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate;
        if (store.getState().loanManager.loanCount === 0) {
            gasEstimate = NEW_FIRST_LOAN_GAS;
        } else {
            gasEstimate = NEW_LOAN_GAS;
        }
        let userAccount = store.getState().ethBase.userAccount;

        let result = await loanManager.newEthBackedLoan(productId, {
            value: web3.toWei(ethAmount),
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
                "e_repayed wasn't event received. Check tx :  " + result.tx
            );
        }
        return {
            txResult: result,
            address: result.logs[0].args.loanContract,
            loanId: result.logs[0].args.loanId.toNumber(),
            productId: result.logs[0].args.productId.toNumber(),
            borrower: result.logs[0].args.borrower,
            disbursedLoanInUcd:
                result.logs[0].args.disbursedLoanInUcd.toNumber() / 10000,
            eth: {
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        throw new Error("Create loan failed. Error: " + error);
    }
}

export async function fetchProductsTx() {
    try {
        let loanManager = store.getState().loanManager.contract.instance;
        let productCount = await loanManager.getProductCount();
        // TODO: get this from store.tokenUcd (timing issues on first load..)
        let decimalsDiv =
            10 **
            (await store
                .getState()
                .tokenUcd.contract.instance.decimals()).toNumber();

        let products = [];
        for (let i = 0; i < productCount; i++) {
            let p = await loanManager.products(i);
            let term = p[0].toNumber();
            // TODO: less precision for duration: https://github.com/jsmreese/moment-duration-format
            let repayPeriod = p[4].toNumber();
            let prod = {
                id: i,
                term: term,
                termText: moment.duration(term, "seconds").humanize(),
                discountRate: p[1].toNumber() / 1000000,
                loanCollateralRatio: p[2].toNumber() / 1000000,
                minDisbursedAmountInUcd: p[3].toNumber() / decimalsDiv,
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
        throw new Error("fetchProductsTx failed. Error: " + error);
    }
}

export async function repayLoanTx(loanId) {
    try {
        let userAccount = store.getState().ethBase.userAccount;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate = REPAY_GAS;
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
            throw new Error(
                "e_repayed wasn't event received. Check tx :  " + result.tx
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
        throw new Error("Repay loan failed. Error: " + error);
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
        throw new Error("fetchLoansToCollectTx failed. Error: " + error);
    }
}

export async function collectLoansTx(loansToCollect) {
    try {
        let userAccount = store.getState().ethBase.userAccount;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate = COLLECT_GAS; // TODO: calculate BASE + gasperloan x N
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
                        "One of the events recevied is not e_collected.\n" +
                        "logs[" +
                        index +
                        "] recevied: " +
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
        throw new Error("Collect loan failed. Error: " + error);
    }
}
