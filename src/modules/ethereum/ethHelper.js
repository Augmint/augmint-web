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
        console.debug("message:", message, "details:", details);
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
