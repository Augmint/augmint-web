const BigNumber = require("bignumber.js");
const testHelper = new require("./testHelper.js");
const TokenAcdMock = artifacts.require("./mocks/TokenAcdMock.sol");
const LoanManager = artifacts.require("./LoanManager.sol");
const Exchange = artifacts.require("./Exchange.sol");
const TRANSFER_MAXFEE = web3.toWei(0.01); // TODO: set this to expected value (+set gasPrice)

module.exports = {
    newTokenAcdMock,
    transferTest,
    getTransferFee,
    getBalances,
    transferEventAsserts,
    balanceAsserts
};

const FeeAccount = artifacts.require("./FeeAccount.sol");
const InterestPoolAccount = artifacts.require("./InterestPoolAccount.sol");
const InterestEarnedAccount = artifacts.require("./InterestEarnedAccount.sol");
let tokenAcd;

async function newTokenAcdMock() {
    //if (typeof tokenAcd == "undefined") {
    tokenAcd = await TokenAcdMock.new(
        FeeAccount.address,
        InterestPoolAccount.address,
        InterestEarnedAccount.address,
        2000 /* transferFeePt in parts per million = 0.2% */,
        200 /* min: 0.02 ACD */,
        50000 /* max fee: 5 ACD */
    );
    await tokenAcd.grantMultiplePermissions(web3.eth.accounts[0], [
        "setSystemAccounts",
        "setTransferFees",
        "transferNoFee)",
        "withdrawTokens",
        "issue"
    ]);
    //}

    return tokenAcd;
}

async function transferTest(testTxInfo, from, to, amount, narrative) {
    let feeAccount = await tokenAcd.feeAccount();
    expTransfer = {
        from: from,
        to: to,
        amount: amount,
        narrative: narrative,
        fee: await getTransferFee(amount)
    };
    let balBefore = await getBalances([from, to, feeAccount]);
    let tx;
    if (narrative === "") {
        tx = await tokenAcd.transferWithNarrative(
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            { from: expTransfer.from }
        );
    } else {
        tx = await tokenAcd.transferWithNarrative(
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

    await balanceAsserts(expBalances);
}

async function getTransferFee(_amount) {
    let feePt, feeMin, feeMax;
    let amount = new BigNumber(_amount);

    await Promise.all([
        (feePt = await tokenAcd.transferFeePt()),
        (feeMax = await tokenAcd.transferFeeMax()),
        (feeMin = await tokenAcd.transferFeeMin())
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

async function getBalances(addresses) {
    let balances = [];
    for (let addr of addresses) {
        balances.push({
            eth: await web3.eth.getBalance(addr),
            ucd: await tokenAcd.balanceOf(addr)
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

async function balanceAsserts(expBalances) {
    for (let expBal of expBalances) {
        let newEthBal = await web3.eth.getBalance(expBal.address);
        let newUcdBal = await tokenAcd.balanceOf(expBal.address);
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
