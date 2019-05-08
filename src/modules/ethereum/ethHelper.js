import store from "modules/store";
import { updateTx, updateTxNonce } from "modules/reducers/submittedTransactions";
import { getNetworkName } from "utils/helpers";

class ExtendableError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = new Error(message).stack;
        }
    }
}

export class EthereumTransactionError extends ExtendableError {
    constructor(message, details, receipt, gasEstimate, ...args) {
        super(message, ...args);
        this.details = details;
        this.receipt = receipt;
        this.gasEstimate = gasEstimate;
    }
}

export async function getNetworkDetails(web3) {
    let networkId = await web3.eth.net.getId();
    networkId = parseInt(networkId, 10);
    const networkType = await web3.eth.net.getNetworkType();
    const networkName = getNetworkName(networkId);

    return {
        id: networkId,
        name: networkName,
        type: networkType
    };
}

/**
    This is the deprecated  process tx using web3.js events. Use sendAndProcessTx instead!
    returns a Promise which resolves a transactionHash and then dispatches
use onReceipt cb arg to do extra checks on the receipt (throw an EthereumTransactionError or return processed args)
*/
export function processTx(tx, txName, gasEstimate, onReceipt, payload) {
    return new Promise((resolve, reject) => {
        let receipt;
        let transactionHash;
        let error;
        tx.once("transactionHash", hash => {
            transactionHash = hash;
            store.dispatch(updateTx({ event: "transactionHash", txName, transactionHash }));
            getTxNonce(transactionHash);
            console.debug(` ${txName} hash received: ${hash}`);
            resolve(transactionHash);
        })

            .on("error", e => {
                error = new EthereumTransactionError(`${txName} failed`, e, receipt, gasEstimate);
                if (transactionHash) {
                    // if error after tx hash then async EthereumTxStatus component handles the error
                    store.dispatch(updateTx({ event: "error", txName, transactionHash, error }));
                } else {
                    // if error before tx submitted then (ie. no tx hash) then the form handles the error
                    reject(error);
                }
            })

            .on("confirmation", (confirmationNumber, rec) => {
                if (!error) {
                    // we receive confirmations of failed txs but we don't want to display those
                    store.dispatch(
                        updateTx({
                            event: "confirmation",
                            txName,
                            transactionHash: rec.transactionHash,
                            confirmationNumber,
                            payload
                        })
                    );
                }
            })

            .once("receipt", rec => {
                try {
                    let onReceiptResult;
                    receipt = rec;
                    console.debug(
                        `  ${txName} receipt received.  gasUsed: ${receipt.gasUsed} txhash: ${receipt.transactionHash}`,
                        receipt
                    );

                    if (receipt.status !== true && receipt.status !== "0x1") {
                        // web3js > beta33 returns bool
                        throw new EthereumTransactionError(
                            `${txName} failed`,
                            "Ethereum transaction returned status: " + receipt.status,
                            receipt,
                            gasEstimate
                        );
                    }

                    if (onReceipt) {
                        onReceiptResult = onReceipt(receipt);
                    }

                    store.dispatch(
                        updateTx({
                            event: "receipt",
                            txName,
                            transactionHash: receipt.transactionHash,
                            receipt,
                            onReceiptResult
                        })
                    );
                } catch (e) {
                    error = e;
                    store.dispatch(
                        updateTx({
                            event: "error",
                            txName,
                            transactionHash: receipt.transactionHash,
                            receipt,
                            error
                        })
                    );
                }
            });
    });
}

function getTxNonce(transactionHash) {
    let eth = store.getState().web3Connect.web3Instance.eth;
    eth.getTransaction(transactionHash, (err, res) => {
        if (res) {
            store.dispatch(updateTxNonce({ nonce: res.nonce, transactionHash: transactionHash }));
            return res.nonce;
        }
        if (err) {
            // TODO
        }
    });
}

/**
 *
 * Use this with new augmint.js transaction (Transaction object style)
 * Resolves with a transactionHash then dispatches updateTx with confirmations
 * Throws if error with send (e.g. user denies signature)
 * If tx reverts then dispatches updateTx with error
 * @export
 * @param {ITransaction} tx
 * @param {string} txName    tx name displayed to user
 * @param {function} formatReceiptDataCb optional callback fumction to extract and format receipt data
 */
export async function sendAndProcessTx(tx, txName, formatReceiptDataCb) {
    const userAccount = store.getState().web3Connect.userAccount;

    const transactionHash = await tx

        .onConfirmation(confirmationNumber => {
            if (!tx.sendError) {
                store.dispatch(updateTx({ event: "confirmation", txName, transactionHash, confirmationNumber }));
            }
        })

        .onceTxRevert((_error, receipt) => {
            // EthereumTxStatus component handles the error
            const error = new EthereumTransactionError(`${txName} failed`, _error, receipt, tx.sendOptions.gasLimit);
            store.dispatch(updateTx({ event: "error", txName, transactionHash, error }));
        })

        .onceReceipt(receipt => {
            console.debug(
                `  ${txName} receipt received.  gasUsed: ${receipt.gasUsed} txhash: ${receipt.transactionHash}`,
                receipt
            );
            const formattedReceiptData = formatReceiptDataCb ? formatReceiptDataCb(receipt) : null;

            store.dispatch(
                updateTx({
                    event: "receipt",
                    txName,
                    transactionHash: receipt.transactionHash,
                    receipt,
                    formattedReceiptData
                })
            );
        })

        .send({ from: userAccount })

        .getTxHash();

    store.dispatch(updateTx({ event: "transactionHash", txName, transactionHash }));
    getTxNonce(transactionHash); // TODO: implement this in augmint-js

    return transactionHash;
}
