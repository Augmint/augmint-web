/*
 TODO: clean up thrown errors
 */

export function asyncGetAccounts(web3) {
    return new Promise(function(resolve, reject) {
        web3.eth.getAccounts((error, accounts) => {
            if (error) {
                reject(new Error("Can't get account list from web3 (asyncGetAccounts).\n " + error));
            } else {
                if (!web3.utils.isAddress(accounts[0])) {
                    reject(
                        new Error(
                            "Can't get default account from web3 (asyncGetAccounts)." +
                                "\nIf you are using Metamask make sure it's unlocked with your password."
                        )
                    );
                }
                resolve(accounts);
            }
        });
    });
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
