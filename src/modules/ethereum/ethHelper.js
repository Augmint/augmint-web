/*
 TODO: clean up thrown errors
 */
import store from "modules/store";
import BigNumber from "bignumber.js";

export function asyncGetBalance(address) {
    return new Promise(function(resolve, reject) {
        let web3 = store.getState().web3Connect.web3Instance;
        web3.eth.getBalance(address, function(error, bal) {
            if (error) {
                reject(
                    new Error(
                        "Can't get balance from web3 (asyncGetBalance). Address: ",
                        address + " Error: " + error
                    )
                );
            } else {
                resolve(web3.fromWei(bal));
            }
        });
    });
}

export function asyncGetAccounts(web3) {
    return new Promise(function(resolve, reject) {
        web3.eth.getAccounts((error, accounts) => {
            if (error) {
                reject(
                    new Error(
                        "Can't get account list from web3 (asyncGetAccounts)." +
                            "\nError: " +
                            error
                    )
                );
            } else {
                if (!web3.isAddress(accounts[0])) {
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

export function asyncGetNetwork(web3) {
    return new Promise(function(resolve, reject) {
        web3.version.getNetwork((error, networkId) => {
            if (error) {
                reject(
                    new Error(
                        "Can't get network from web3 (asyncGetNetwork). Error: " +
                            error
                    )
                );
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

export function asyncGetBlock(blockNumber) {
    return new Promise(function(resolve, reject) {
        let web3 = store.getState().web3Connect.web3Instance;
        web3.eth.getBlock(blockNumber, function(error, block) {
            if (error) {
                reject(
                    new Error(
                        "Can't getBlock from web3 (asyncGetBalance). blockNumber: ",
                        blockNumber + "\nError: " + error
                    )
                );
            } else {
                resolve(block);
            }
        });
    });
}

export function asyncFilterGet(filter) {
    return new Promise(function(resolve, reject) {
        //let web3 = store.getState().web3Connect.web3Instance;
        filter.get(function(error, result) {
            if (error) {
                reject(
                    new Error(
                        "Can't get filter from  (asyncGetBalance). Filter: ",
                        filter + "\nError: " + error
                    )
                );
            } else {
                resolve(result);
            }
        });
    });
}

// export function asyncGetTransaction(transactionHash) {
//     return new Promise(function(resolve, reject) {
//         let web3 = store.getState().web3Connect.web3Instance;
//         web3.getTransaction(function(error, result) {
//             if (error) {
//                 reject(
//                     new Error(
//                         "Can't get filter from  (asyncGetBalance). transactionHash: ",
//                         transactionHash + "\nError: " + error
//                     )
//                 );
//             } else {
//                 resolve(result);
//             }
//         });
//     });
// }

export async function getUcdBalance(address) {
    let tokenUcd = store.getState().tokenUcd;
    let bn_balance = await tokenUcd.contract.instance.balanceOf(address);
    let bn_decimalsDiv = tokenUcd.info.bn_decimalsDiv;

    if (bn_decimalsDiv === null || bn_decimalsDiv === "?") {
        // this is a workround for timing issue with tokenUcd refresh
        // TODO: figure out how to rearrange refresh to avoid these checks
        bn_decimalsDiv = new BigNumber(10).pow(
            await tokenUcd.contract.instance.decimals()
        );
    }
    return bn_balance.div(bn_decimalsDiv);
}
