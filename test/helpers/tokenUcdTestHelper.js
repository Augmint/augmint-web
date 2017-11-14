var TokenUcd = artifacts.require("./TokenUcd.sol");
//var testHelper = new require("./testHelper.js");

module.exports = {
    newTokenUcd,
    getBalances,
    balanceAsserts
};

function newTokenUcd(initialUcdBalance) {
    return new Promise(async function(resolve, reject) {
        let instance = await TokenUcd.new();
        if (initialUcdBalance > 0) {
            await instance.issueUcd(initialUcdBalance);
            await instance.getUcdFromReserve(initialUcdBalance);
        }
        resolve(instance);
    });
}

async function getBalances(tokenUcd, addresses) {
    let balances = [];
    for (let addr of addresses) {
        balances.push({
            eth: await web3.eth.getBalance(addr),
            ucd: await tokenUcd.balanceOf(addr)
        });
    }
    return balances;
}

async function balanceAsserts(tokenUcd, expBalances) {
    for (let expBal of expBalances) {
        let newEthBal = await web3.eth.getBalance(expBal.address);
        let newUcdBal = await tokenUcd.balanceOf(expBal.address);
        let expGasFee = expBal.gasFee == null ? 0 : expBal.gasFee;
        // console.log(
        //     expBal.name,
        //     newEthBal.toString(),
        //     expBal.eth.toString(),
        //     expGasFee
        // );
        assert.isAtMost(
            newEthBal
                .minus(expBal.eth)
                .absoluteValue()
                .toNumber(),
            expGasFee,
            expBal.name +
                " new and initial ETH balance diferrence is higher than expecteed "
        );
        assert.equal(
            newUcdBal.toString(),
            expBal.ucd.toString(),
            expBal.name + " new ACD balance is not as expected"
        );
    }
}
