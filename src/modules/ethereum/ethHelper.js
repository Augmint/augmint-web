/* TODO: consider moving processTx somewhere else */
import store from "modules/store";
import { updateTx } from "modules/reducers/submittedTransactions";

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
    let networkType = await web3.eth.net.getNetworkType();
    let networkName;
    switch (networkId) {
        case 1:
            networkName = "Main";
            break;
        case 2:
            networkName = "Morden";
            break;
        case 3:
            networkName = "Ropsten";
            break;
        case 4:
            networkName = "Rinkeby";
            break;
        case 42:
            networkName = "Kovan";
            break;
        case 999:
            networkName = "Testrpc";
            break;
        case 4447:
            networkName = "TruffleLocal";
            break;
        case 1976:
            networkName = "PrivateChain";
            break;
        default:
            networkName = "Unknown";
    }
    return {
        id: networkId,
        name: networkName,
        type: networkType
    };
}

/* returns a Promise which resolves a transactionHash and then dispatches
use onReceipt cb arg to do extra checks on the receipt (throw an EthereumTransactionError or return processed args)
*/
export function processTx(tx, txName, gasEstimate, onReceipt) {
    return new Promise((resolve, reject) => {
        let receipt;
        let transactionHash;
        let error;
        tx
            .once("transactionHash", hash => {
                transactionHash = hash;
                store.dispatch(updateTx({ event: "transactionHash", txName, transactionHash }));
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
                            confirmationNumber
                        })
                    );
                }
                console.debug(
                    `  ${txName} Confirmation #${confirmationNumber} received. txhash: ${rec.transactionHash}`
                );
            })

            .once("receipt", rec => {
                try {
                    let onReceiptResult;
                    receipt = rec;

                    console.debug(
                        `  ${txName} receipt received.  gasUsed: ${receipt.gasUsed} txhash: ${receipt.transactionHash}`,
                        receipt
                    );

                    if (receipt.status !== "0x1" && receipt.status !== "0x01") {
                        // ganache returns 0x01, Rinkeby 0x1
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
