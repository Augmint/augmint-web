/*
All ethereum state changing transactions happening here.
Only called from reducers.

    TODO: consider splitting it by contract or feature
    TODO: tune default gasPrice
    TODO: clean up thrown errors
    TODO: set gasEstimates when it gas consumption has settled.
 */
import store from "modules/store";
import BigNumber from "bignumber.js";
import { fetchLoanDetailsByAddress } from "modules/reducers/loans";
import moment from "moment";
import stringifier from "stringifier";
import { asyncFilterGet, asyncGetBlock } from "modules/ethereum/ethHelper";

const stringify = stringifier({ maxDepth: 5, indent: "   " });

const NEW_LOAN_GAS = 2000000; // As of now it's on testRPC: first= 762376  additional = 702376
const NEW_FIRST_LOAN_GAS = 2000000;
const REPAY_GAS = 3000000;
const COLLECT_GAS = 3000000;
const TRANSFER_UCD_GAS = 3000000;

export async function newEthBackedLoanTx(productId, ethAmount) {
    try {
        let web3 = store.getState().web3Connect.web3Instance;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate;
        if (store.getState().loanManager.loanCount === 0) {
            gasEstimate = NEW_FIRST_LOAN_GAS;
        } else {
            gasEstimate = NEW_LOAN_GAS;
        }
        let userAccount = store.getState().web3Connect.userAccount;
        let weiAmount = web3.toWei(new BigNumber(ethAmount));
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

export async function transferUcdTx(payee, ucdAmount) {
    try {
        let gasEstimate = TRANSFER_UCD_GAS;
        let userAccount = store.getState().web3Connect.userAccount;
        let tokenUcd = store.getState().tokenUcd;
        let ucdcAmount = ucdAmount.times(tokenUcd.info.bn_decimalsDiv);
        let result = await tokenUcd.contract.instance.transfer(
            payee,
            ucdcAmount,
            {
                from: userAccount,
                gas: gasEstimate
            }
        );
        console.log(result);
        if (result.receipt.gasUsed === gasEstimate) {
            // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw new Error(
                "UCD transfer failed. All gas provided was used:  " +
                    result.receipt.gasUsed
            );
        }

        /* TODO:  display result in confirmation */

        if (
            !result.logs ||
            !result.logs[0] ||
            result.logs[0].event !== "e_transfer"
        ) {
            throw new Error(
                "e_transfer wasn't event received. Check tx :  " + result.tx
            );
        }

        let bn_amount = result.logs[0].args.amount.div(new BigNumber(10000));
        return {
            txResult: result,
            to: result.logs[0].args.to,
            from: result.logs[0].args.from,
            bn_amount: bn_amount,
            amount: bn_amount.toString(),
            narrative: result.logs[0].args.narrative,
            eth: {
                gasProvided: gasEstimate,
                gasUsed: result.receipt.gasUsed,
                tx: result.tx
            }
        };
    } catch (error) {
        throw new Error("UCD transfer failed.\n" + error);
    }
}

export async function fetchTransferListTx(address, fromBlock, toBlock) {
    try {
        let tokenUcd = store.getState().tokenUcd.contract.instance;
        let outFilter = tokenUcd.e_transfer(
            { from: address },
            { fromBlock: fromBlock, toBlock: toBlock }
        );
        let filterResult = await asyncFilterGet(outFilter);

        let inFilter = tokenUcd.e_transfer(
            { to: address },
            { fromBlock: fromBlock, toBlock: toBlock }
        );
        filterResult = filterResult.concat(await asyncFilterGet(inFilter));

        let transfers = await Promise.all(
            filterResult.map((tx, index) => {
                return formatTransfer(address, tx);
            })
        );

        transfers.sort((a, b) => {
            return b.blockTimeStamp - a.blockTimeStamp;
        });

        return transfers;
    } catch (error) {
        throw new Error("fetchTransferList failed.\n" + error);
    }
}

export async function processTransferTx(address, tx) {
    try {
        let transfers = store.getState().userTransfers.transfers;
        let result = await formatTransfer(address, tx);
        // TODO: sort and look for dupes?

        if (transfers !== null) {
            result = [result, ...transfers];
        } else {
            result = [result];
        }
        return result;
    } catch (error) {
        throw new Error("processTransferTx failed.\n" + error);
    }
}

async function formatTransfer(address, tx) {
    let direction = address === tx.args.from ? -1 : 1;
    let blockTimeStamp = (await asyncGetBlock(tx.blockNumber)).timestamp;
    let bn_amount = tx.args.amount.div(new BigNumber(10000));
    let result = {
        blockNumber: tx.blockNumber,
        transactionIndex: tx.transactionIndex,
        transactionHash: tx.transactionHash,
        type: tx.type,
        bn_amount: bn_amount,
        direction: direction === -1 ? "out" : "in",
        amount: bn_amount.times(direction).toString(),
        from: tx.args.from,
        to: tx.args.to,
        narrative: tx.args.narrative,
        blockTimeStamp: blockTimeStamp,
        blockTimeStampText: moment
            .unix(blockTimeStamp)
            .format("D MMM YYYY HH:mm")
    };
    return result;
}
