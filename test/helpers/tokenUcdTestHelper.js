const BigNumber = require("bignumber.js");
const testHelper = new require("./testHelper.js");
const TokenAcdMock = artifacts.require("./mocks/TokenAcdMock.sol");
const TRANSFER_MAXFEE = web3.toWei(0.01); // TODO: set this to expected value (+set gasPrice)

module.exports = {
    newTokenAcdMock,
    transferTest,
    getTransferFee,
    getBalances,
    transferEventAsserts,
    balanceAsserts,
    approveEventAsserts,
    transferFromTest,
    approveTest
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
        "transferNoFee",
        "transferFromNoFee",
        "withdrawTokens",
        "issue"
    ]);
    //}

    return tokenAcd;
}

async function transferTest(testInstance, expTransfer) {
    // if fee is provided than we are testing transferNoFee
    if (typeof expTransfer.fee === "undefined") expTransfer.fee = await getTransferFee(expTransfer.amount);
    if (typeof expTransfer.narrative === "undefined") expTransfer.narrative = "";
    let feeAccount = await tokenAcd.feeAccount();

    let balBefore = await getBalances([expTransfer.from, expTransfer.to, feeAccount]);
    let tx, txName;
    if (expTransfer.fee === 0) {
        txName = "transferNoFee";
        tx = await tokenAcd.transferNoFee(expTransfer.from, expTransfer.to, expTransfer.amount, expTransfer.narrative, {
            from: expTransfer.from
        });
    } else if (expTransfer.narrative === "") {
        txName = "transfer";
        tx = await tokenAcd.transfer(expTransfer.to, expTransfer.amount, {
            from: expTransfer.from
        });
    } else {
        txName = "transferWithNarrative";
        tx = await tokenAcd.transferWithNarrative(expTransfer.to, expTransfer.amount, expTransfer.narrative, {
            from: expTransfer.from
        });
    }
    transferEventAsserts(tx, expTransfer);
    testHelper.logGasUse(testInstance, tx, txName);
    let expBalances = [
        {
            name: "acc from",
            address: expTransfer.from,
            ucd: balBefore[0].ucd.minus(expTransfer.amount).minus(expTransfer.fee),
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

async function approveTest(testInstance, expApprove) {
    let tx = await tokenAcd.approve(expApprove.spender, expApprove.value, {
        from: expApprove.owner
    });
    approveEventAsserts(tx, expApprove);
    testHelper.logGasUse(testInstance, tx, "approve");
    let newAllowance = await tokenAcd.allowance(expApprove.owner, expApprove.spender);
    assert.equal(newAllowance.toString(), expApprove.value.toString(), "allowance value should be set");
}

async function transferFromTest(testInstance, expTransfer) {
    // if fee is provided than we are testing transferFromNoFee
    let isNoFeeTest = typeof expTransfer.fee === "undefined" ? false : true;
    expTransfer.fee = 0; // transferFrom deducts transfer fee from beneficiary
    if (typeof expTransfer.narrative === "undefined") expTransfer.narrative = "";
    let feeAccount = await tokenAcd.feeAccount();
    let fee = 0;
    let expFeeTransfer;
    if (!isNoFeeTest) {
        fee = (await getTransferFee(expTransfer.amount)).toNumber();

        expFeeTransfer = {
            from: expTransfer.to,
            to: feeAccount,
            amount: fee,
            narrative: "TransferFrom fee",
            fee: 0
        };
    }
    let allowanceBefore = await tokenAcd.allowance(expTransfer.from, expTransfer.to);
    let balBefore = await getBalances([expTransfer.from, expTransfer.to, feeAccount]);
    let tx, txName;
    if (isNoFeeTest) {
        txName = "transferFromNoFee";
        tx = await tokenAcd.transferFromNoFee(
            expTransfer.from,
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            {
                from: expTransfer.to
            }
        );
    } else if (expTransfer.narrative === "") {
        txName = "transferFrom";
        tx = await tokenAcd.transferFrom(expTransfer.from, expTransfer.to, expTransfer.amount, {
            from: expTransfer.to
        });
    } else {
        txName = "transferFromWithNarrative";
        tx = await tokenAcd.transferFromWithNarrative(
            expTransfer.from,
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            {
                from: expTransfer.to
            }
        );
    }

    transferEventAsserts(tx, expTransfer, 0);
    if (!isNoFeeTest) {
        transferEventAsserts(tx, expFeeTransfer, 1);
    }
    let allowanceAfter = await tokenAcd.allowance(expTransfer.from, expTransfer.to);
    assert.equal(
        allowanceBefore.sub(expTransfer.amount).toString(),
        allowanceAfter.toString(),
        "allowance should be reduced with transferred amount"
    );
    testHelper.logGasUse(testInstance, tx, txName);
    let expBalances = [
        {
            name: "acc from",
            address: expTransfer.from,
            ucd: balBefore[0].ucd.minus(expTransfer.amount),
            eth: balBefore[0].eth
        },
        {
            name: "acc to",
            address: expTransfer.to,
            ucd: balBefore[1].ucd.plus(expTransfer.amount).minus(fee), // amount less fee
            eth: balBefore[1].eth,
            gasFee: TRANSFER_MAXFEE
        },
        {
            name: "acc fee",
            address: feeAccount,
            ucd: balBefore[2].ucd.plus(fee),
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

async function transferEventAsserts(tx, expTransfer, logIndex) {
    if (typeof logIndex === "undefined") logIndex = 0;
    assert.equal(tx.logs[logIndex].event, "Transfer", "Transfer event should be emited");
    assert.equal(tx.logs[logIndex].args.from, expTransfer.from, "from: in Transfer event should be set");
    assert.equal(tx.logs[logIndex].args.to, expTransfer.to, "to: in Transfer event should be set");
    assert.equal(tx.logs[logIndex].args.narrative, expTransfer.narrative, "narrative in Transfer event should be set");
    assert.equal(
        tx.logs[logIndex].args.amount.toString(),
        expTransfer.amount.toString(),
        "amount in Transfer event should be set"
    );
    assert.equal(
        tx.logs[logIndex].args.fee.toString(),
        expTransfer.fee.toString(),
        "fee in Transfer event should be set"
    );
}

async function approveEventAsserts(tx, expApprove) {
    assert.equal(tx.logs[0].event, "Approval", "Approve event should be emited");
    assert.equal(tx.logs[0].args._owner, expApprove.owner, "_owner: in Approve event should be set");
    assert.equal(tx.logs[0].args._spender, expApprove.spender, "_spender: in Approve event should be set");

    assert.equal(
        tx.logs[0].args._value.toString(),
        expApprove.value.toString(),
        "_value in Approve event should be set"
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
            expBal.name + " new and initial ETH balance diferrence is higher than expecteed "
        );
        assert.equal(newUcdBal.toString(), expBal.ucd.toString(), expBal.name + " new ACD balance is not as expected");
    }
}
