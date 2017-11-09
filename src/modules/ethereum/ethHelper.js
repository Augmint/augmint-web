/*
 TODO: clean up thrown errors
 */
import store from "modules/store";
import BigNumber from "bignumber.js";

export async function asyncGetBalance(address, defaultBlock) {
    let web3 = store.getState().web3Connect.web3Instance;
    let defBlock = defaultBlock;
    if (defBlock == null) {
        defBlock = "latest";
    }
    let bal = await web3.eth.getBalance(address, defBlock);
    let ret = new BigNumber(web3.utils.fromWei(bal));
    return ret;
}

export function asyncGetAccounts(web3) {
    return new Promise(function(resolve, reject) {
        web3.eth.getAccounts((error, accounts) => {
            if (error) {
                reject(
                    new Error(
                        "Can't get account list from web3 (asyncGetAccounts).\n " +
                            error
                    )
                );
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

export function asyncGetBlock(blockNumber) {
    return new Promise(function(resolve, reject) {
        let web3 = store.getState().web3Connect.web3Instance;
        web3.eth.getBlock(blockNumber, function(error, block) {
            if (error) {
                reject(
                    new Error(
                        "Can't getBlock from web3 (asyncGetBalance). blockNumber: ",
                        blockNumber + "\n" + error
                    )
                );
            } else {
                resolve(block);
            }
        });
    });
}

export function getEventLogs(contract, event, filters, fromBlock, toBlock) {
    // It's only tested with getEventLogs(tokenUcd.e_transfer, {topic1: value, topic2: value}, fromBlock, toBlock);
    // TODO: add timeout & error handling for etherscan XMLHttpRequest
    // TODO: refactor abi-decoder to match structure of filter.get so we don't need to mess so much with decodedParams
    return new Promise(async function(resolve, reject) {
        let web3Network = store.getState().web3Connect.network;
        let filterResult = [];
        if (web3Network.id === 4 || web3Network.id === 3) {
            // on non-local networks we query from etherScan b/c filter.get times out
            let eventFilter = event(filters).options;
            let address = eventFilter.address;
            let topic0 = eventFilter.topics[0];
            let topicFilters = "";
            if (eventFilter.topics.length > 1) {
                // topic 0 is event signature
                topicFilters += "&topic0_1_opr=and";
            }
            for (let i = 0; i < eventFilter.topics.length; i++) {
                if (i > 0) {
                    topicFilters += "&topic" + i + "_" + (i + 1) + "_opr=or";
                }
                topicFilters +=
                    "&topic" + (i + 1) + "=" + eventFilter.topics[i + 1];
            }
            let xhr = new XMLHttpRequest();
            let etherScanHost =
                web3Network.id === 4
                    ? "https://rinkeby.etherscan.io"
                    : "https://ropsten.etherscan.io";
            let etherscanURL =
                etherScanHost +
                "/api?module=logs&action=getLogs" +
                "&fromBlock=" +
                fromBlock +
                "&toBlock=" +
                toBlock +
                "&address=" +
                address +
                "&topic0=" +
                topic0 +
                topicFilters +
                "&apikey=ZYSCPZX32KBBET6XZXX8T1T21ZFPY8R8RP";
            xhr.open("GET", etherscanURL, true);
            //xhr.setRequestHeader("Content-Type", "application/json");
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    let res = JSON.parse(xhr.response);
                    //console.debug("Response from etherScan (xhr.response):", xhr.response);
                    //console.debug("JSON.parse(xhr.response) ", res);
                    let decodedData = contract.abiDecoder.decodeLogs(
                        res.result
                    );
                    // console.debug(
                    //     "contract.abiDecoder.decodeLogs(res.result) ",
                    //     decodedData
                    // );
                    for (let i = 0; i < decodedData.length; i++) {
                        let r = res.result[i];
                        let blockNumber = parseInt(r.blockNumber, 16);
                        filterResult.push({
                            address: r.address,
                            blockNumber: blockNumber,
                            gasPrice: parseInt(r.gasPrice, 16),
                            gasUsed: parseInt(r.gasUsed, 16),
                            logIndex:
                                r.logIndex === "0x"
                                    ? 0
                                    : parseInt(r.logIndex, 16),
                            timeStamp: parseInt(r.timeStamp, 16),
                            transactionHash: r.transactionHash,
                            transactionIndex:
                                r.transactionIndex === "0x"
                                    ? 0
                                    : parseInt(r.transactionIndex, 16),
                            type: blockNumber > 0 ? "mined" : "pending",
                            event: decodedData[i].name,
                            args: decodedData[i].args
                        });
                    }
                    resolve(filterResult);
                }
            }; // xhr.onreadystatechange
            await xhr.send();
        } else {
            // on local testchains (testrpc or pricatechain) we query directly with filter.get
            // we need to run a seperate filter.get for each filter because filter.get doesn't support operator 'or'
            for (var key in filters) {
                if (filters.hasOwnProperty(key)) {
                    let filterOptions = {};
                    filterOptions[key] = filters[key];
                    let filter = event(filterOptions, {
                        fromBlock: fromBlock,
                        toBlock: toBlock
                    });
                    filterResult = filterResult.concat(
                        await asyncFilterGet(filter)
                    );
                }
            }
            resolve(filterResult);
        }
    });
}

export function asyncFilterGet(filter) {
    return new Promise(function(resolve, reject) {
        filter.get(function(error, result) {
            if (error) {
                console.error(error);
                reject(
                    new Error(
                        "asyncFilterGet failed. Filter: ",
                        filter,
                        "\nError: " + error
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

export async function getUcdBalance(address, defaultBlock) {
    return new Promise(
        function(resolve, reject) {
            let tokenUcd = store.getState().tokenUcd;
            let defBlock = defaultBlock;
            if (defBlock == null) {
                defBlock = "latest";
            }

            tokenUcd.contract.instance.contract.balanceOf(
                address,
                defaultBlock,
                async function(error, bn_balance) {
                    if (error) {
                        reject(
                            new Error(
                                "Can't get ACD balance from tokenUcd (getUcdBalance). Address: ",
                                address + "\n" + error
                            )
                        );
                    } else {
                        let bn_decimalsDiv = tokenUcd.info.bn_decimalsDiv;

                        if (bn_decimalsDiv === null || bn_decimalsDiv === "?") {
                            // this is a workround for timing issue with tokenUcd refresh
                            // TODO: figure out how to rearrange refresh to avoid these checks
                            bn_decimalsDiv = new BigNumber(10).pow(
                                await tokenUcd.contract.instance.decimals()
                            );
                        }

                        resolve(bn_balance.div(bn_decimalsDiv));
                    }
                }
            );
        }
        // https://ethereum.stackexchange.com/questions/25756/passing-defaultblock-pending-param-to-a-truffle-contract-call
    );
}
