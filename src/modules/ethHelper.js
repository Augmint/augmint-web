/*
 TODO: gasPrice param
 */
import store from './../store'

// TODO: set gasEstimates when it settled.
const NEW_LOAN_GAS = 2000000; // As of now it's on testRPC: first= 762376  additional = 702376
const NEW_FIRST_LOAN_GAS = 2000000;
const REPAY_GAS = 200000;

export function asyncGetBalance( address) {
    return new Promise( function (resolve, reject) {
        let web3 = store.getState().ethBase.web3Instance;
        web3.eth.getBalance(address, function(error, bal) {
            if(error) {
                reject(error);
            } else {
                resolve(web3.fromWei(bal).toNumber());
            }
        });
    });
}

export async function getUcdBalance( address) {
    let tokenUcd = store.getState().tokenUcd;
    let balance = (await tokenUcd.contract.instance.balanceOf(address)).toNumber();
    let decimalsDiv = tokenUcd.decimalsDiv;
    if ( tokenUcd.decimalsDiv === null || tokenUcd.decimalsDiv === "?") {
        // this is a workround for timing issue with tokenUcd refresh
        // TODO: figure out how to rearrange refresh to avoid these checks
        decimalsDiv = 10 ** ( await tokenUcd.contract.instance.decimals() ).toNumber();
    }
    return balance / decimalsDiv ;
}

export async function newEthBackedLoanTx(productId, ethAmount) {
    try {
        let web3 = store.getState().ethBase.web3Instance;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate;
        if( store.getState().loanManager.loanCount === 0 ) {
            gasEstimate = NEW_FIRST_LOAN_GAS ;
        } else {
            gasEstimate = NEW_LOAN_GAS;
        }
        let userAccount = store.getState().ethBase.userAccount;

        let result = await loanManager.newEthBackedLoan(productId,
            {value: web3.toWei(ethAmount), from: userAccount, gas: gasEstimate } );

        if( result.receipt.gasUsed === gasEstimate) { // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw(new Error( "All gas provided was used:  " + result.receipt.gasUsed));
        }

        if( !result.logs || !result.logs[0] || result.logs[0].event !== "e_newLoan") {
            throw(new Error( "e_repayed wasn't event received. Check tx :  " + result.tx));
        }
        console.log( )
        return (
            {
                txResult: result,
                address: result.logs[0].args.loanContract,
                disbursedLoanInUcd: result.logs[0].args.disbursedLoanInUcd.toNumber() / 10000,
                eth : {
                    gasProvided: gasEstimate,
                    gasUsed: result.receipt.gasUsed,
                    tx: result.tx
                }
            }
        )
    } catch (error) {
        throw(new Error( "Create loan failed. Error: " + error));
    }
}

export async function repayLoanTx(loanId) {
    try {
        let userAccount = store.getState().ethBase.userAccount;
        let loanManager = store.getState().loanManager.contract.instance;
        let gasEstimate = REPAY_GAS;
        let result = await loanManager.repay(loanId, { from: userAccount, gas: gasEstimate })
        if( result.receipt.gasUsed === gasEstimate) { // Neeed for testnet behaviour (TODO: test it!)
            // TODO: add more tx info
            throw(new Error( "All gas provided was used:  " + result.receipt.gasUsed));
        }
        console.log(result);
        if( !result.logs || !result.logs[0] || result.logs[0].event !== "e_repayed") {
            throw(new Error( "e_repayed wasn't event received. Check tx :  " + result.tx));
        }

        return (
            {
                txResult: result,
                eth: { // TODO:  make it mre generic for all txs
                    gasProvided: gasEstimate,
                    gasUsed: result.receipt.gasUsed,
                    tx: result.tx
                }
            }
        )
    } catch (error) {
        // TODO: return eth { tx: ...} so that EthSubmissionErrorPanel can display it
        throw(new Error( "Repay loan failed. Error: " + error));
    }
}
