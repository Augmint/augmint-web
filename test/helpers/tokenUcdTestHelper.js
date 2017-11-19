module.exports = {
    getBalances,
    transferEventAsserts,
    balanceAsserts
};

/* This returning a new instance for some reason for subsequent test runs
const TokenUcd = artifacts.require("./TokenAcd.sol");
async function getTokenUcd(initialUcdBalance) {
    let instance = await TokenUcd.deployed();
    if (initialUcdBalance > 0) {
        await instance.issue(initialUcdBalance);
        await instance.getFromReserve(initialUcdBalance);
    }
    return instance;
}
*/

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

async function transferEventAsserts(tx, expTransfer) {
    assert.equal(
        tx.logs[0].event,
        "e_transfer",
        "e_transfer event should be emited"
    );
    assert.equal(
        tx.logs[0].args.from,
        expTransfer.from,
        "from: in e_transfer event should be set"
    );
    assert.equal(
        tx.logs[0].args.to,
        expTransfer.to,
        "to: in e_transfer event should be set"
    );
    assert.equal(
        tx.logs[0].args.narrative,
        expTransfer.narrative,
        "narrative in e_transfer event should be set"
    );
    assert.equal(
        tx.logs[0].args.amount.toString(),
        expTransfer.amount.toString(),
        "amount in e_transfer event should be set"
    );
}

async function balanceAsserts(tokenUcd, expBalances) {
    for (let expBal of expBalances) {
        let newEthBal = await web3.eth.getBalance(expBal.address);
        let newUcdBal = await tokenUcd.balanceOf(expBal.address);
        let expGasFee = expBal.gasFee == null ? 0 : expBal.gasFee;
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
