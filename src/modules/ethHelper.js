import store from './../store'

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
