const BigNumber = require("bignumber.js");
const testHelper = new require("./testHelper.js");
const TokenUcd = artifacts.require("./TokenAcd.sol");
const TRANSFER_MAXFEE = web3.toWei(0.01); // TODO: set this to expected value (+set gasPrice)

module.exports = {
    transferTest,
    getTransferFee,
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

async function transferTest(testTxInfo, from, to, amount, narrative) {
    tokenUcd = TokenUcd.at(TokenUcd.address);
    let feeAccount = await tokenUcd.feeAccount();
    expTransfer = {
        from: from,
        to: to,
        amount: amount,
        narrative: narrative,
        fee: await getTransferFee(amount)
    };
    let balBefore = await getBalances(tokenUcd, [from, to, feeAccount]);
    let tx;
    if (narrative === "") {
        tx = await tokenUcd.transferWithNarrative(
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            { from: expTransfer.from }
        );
    } else {
        tx = await tokenUcd.transferWithNarrative(
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            { from: expTransfer.from }
        );
    }
    transferEventAsserts(tx, expTransfer);
    testHelper.logGasUse(testTxInfo.test, tx, testTxInfo.name);
    let expBalances = [
        {
            name: "acc from",
            address: expTransfer.from,
            ucd: balBefore[0].ucd
                .minus(expTransfer.amount)
                .minus(expTransfer.fee),
            eth: balBefore[0].eth,
            gasFee: TRANSFER_MAXFEE
        },
        {
            name: "acc to",
            address: expTransfer.to,
            ucd: balBefore[1].ucd.plus(expTransfer.amount),
            eth: balBefore[1].eth
        },
        {
            name: "acc fee",
            address: feeAccount,
            ucd: balBefore[2].ucd.plus(expTransfer.fee),
            eth: balBefore[2].eth
        }
    ];

    await balanceAsserts(tokenUcd, expBalances);
}

async function getTransferFee(_amount) {
    let tokenUcd, feePt, feeMin, feeMax;
    let amount = new BigNumber(_amount);
    tokenUcd = TokenUcd.at(TokenUcd.address);

    await Promise.all([
        (feePt = await tokenUcd.transferFeePt()),
        (feeMax = await tokenUcd.transferFeeMax()),
        (feeMin = await tokenUcd.transferFeeMin())
    ]);

    let fee = amount
        .mul(feePt)
        .div(1000000)
        .round(0, BigNumber.ROUND_DOWN);
    if (fee < feeMin) {
        fee = feeMin;
    } else if (fee > feeMax) {
        fee = feeMax;
    }
    return fee;
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
    assert.equal(
        tx.logs[0].args.fee.toString(),
        expTransfer.fee.toString(),
        "fee in e_transfer event should be set"
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
