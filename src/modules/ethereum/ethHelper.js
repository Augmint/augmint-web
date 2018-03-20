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
    constructor(message, details, txResult, gasEstimate, ...args) {
        super(message, ...args);
        this.details = details;
        this.txResult = txResult;
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

export async function processTx(tx, txName, gasEstimate) {
    tx
        .on("confirmation", (confirmationNumber, receipt) => {
            console.log(receipt);
            console.debug(
                `  ${txName} Confirmation #${confirmationNumber} received. txhash: ${receipt.transactionHash}`
            );
        })
        .then(receipt => {
            console.debug(` ${txName}  mined. Hash: ${receipt.transactionHash}`);
        });

    const receipt = await tx
        .once("transactionHash", hash => {
            console.debug(` ${txName} hash received: ${hash}`);
        })
        .on("error", error => {
            throw new EthereumTransactionError(`${txName} failed`, error, null, gasEstimate);
        })
        .once("receipt", receipt => {
            console.debug(
                `  ${txName} receipt received.  gasUsed: ${receipt.gasUsed} txhash: ${receipt.transactionHash}`,
                receipt
            );
            return receipt;
        });

    if (receipt.status !== "0x1" && receipt.status !== "0x01") {
        // ganache returns 0x01, Rinkeby 0x1
        throw new EthereumTransactionError(
            `${txName} failed`,
            "Ethereum transaction returned status: " + receipt.status,
            receipt,
            gasEstimate
        );
    }

    return receipt;
}
