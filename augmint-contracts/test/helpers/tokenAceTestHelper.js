const BigNumber = require("bignumber.js");
const testHelper = new require("./testHelper.js");
const TokenAceMock = artifacts.require("./mocks/TokenAceMock.sol");
const TRANSFER_MAXFEE = web3.toWei(0.01); // TODO: set this to expected value (+set gasPrice)

module.exports = {
    newTokenAceMock,
    transferTest,
    getTransferFee,
    getAllBalances,
    transferEventAsserts,
    assertBalances,
    approveEventAsserts,
    transferFromTest,
    approveTest
};

const FeeAccount = artifacts.require("./FeeAccount.sol");
const InterestEarnedAccount = artifacts.require("./InterestEarnedAccount.sol");
let tokenAce, feeAccount;

async function newTokenAceMock(tokenOwner = web3.eth.accounts[0]) {
    tokenAce = await TokenAceMock.new(
        FeeAccount.address,
        InterestEarnedAccount.address,
        2000 /* transferFeePt in parts per million = 0.2% */,
        200 /* min: 0.02 ACE */,
        50000 /* max fee: 5 ACE */
    );
    feeAccount = FeeAccount.address;

    await tokenAce.grantMultiplePermissions(tokenOwner, ["MonetaryBoard", "NoFeeTransferContracts"]);

    return tokenAce;
}

async function transferTest(testInstance, expTransfer) {
    // if fee is provided than we are testing transferNoFee
    if (typeof expTransfer.fee === "undefined") expTransfer.fee = await getTransferFee(expTransfer.amount);
    if (typeof expTransfer.narrative === "undefined") expTransfer.narrative = "";

    const balBefore = await getAllBalances({
        from: expTransfer.from,
        to: expTransfer.to,
        feeAccount: feeAccount
    });

    let tx, txName;
    if (expTransfer.fee === 0) {
        txName = "transferNoFee";
        tx = await tokenAce.transferNoFee(expTransfer.to, expTransfer.amount, expTransfer.narrative, {
            from: expTransfer.from
        });
    } else if (expTransfer.narrative === "") {
        txName = "transfer";
        tx = await tokenAce.transfer(expTransfer.to, expTransfer.amount, {
            from: expTransfer.from
        });
    } else {
        txName = "transferWithNarrative";
        tx = await tokenAce.transferWithNarrative(expTransfer.to, expTransfer.amount, expTransfer.narrative, {
            from: expTransfer.from
        });
    }
    await transferEventAsserts(expTransfer);
    testHelper.logGasUse(testInstance, tx, txName);

    await assertBalances(balBefore, {
        from: {
            ace: balBefore.from.ace.minus(expTransfer.amount).minus(expTransfer.fee),
            eth: balBefore.from.eth,
            gasFee: TRANSFER_MAXFEE
        },
        to: {
            ace: balBefore.to.ace.add(expTransfer.amount),
            eth: balBefore.to.eth
        },
        feeAccount: {
            ace: balBefore.feeAccount.ace.plus(expTransfer.fee),
            eth: balBefore.feeAccount.eth
        }
    });
}

async function approveTest(testInstance, expApprove) {
    const tx = await tokenAce.approve(expApprove.spender, expApprove.value, {
        from: expApprove.owner
    });
    await approveEventAsserts(expApprove);
    testHelper.logGasUse(testInstance, tx, "approve");
    const newAllowance = await tokenAce.allowance(expApprove.owner, expApprove.spender);
    assert.equal(newAllowance.toString(), expApprove.value.toString(), "allowance value should be set");
}

async function transferFromTest(testInstance, expTransfer) {
    // if fee is provided than we are testing transferFromNoFee
    let isNoFeeTest = typeof expTransfer.fee === "undefined" ? false : true;
    if (!expTransfer.to) {
        expTransfer.to = expTransfer.spender;
    }
    if (typeof expTransfer.narrative === "undefined") expTransfer.narrative = "";
    expTransfer.fee = isNoFeeTest ? 0 : (await getTransferFee(expTransfer.amount)).toNumber();

    const allowanceBefore = await tokenAce.allowance(expTransfer.from, expTransfer.spender);
    const balBefore = await getAllBalances({
        from: expTransfer.from,
        to: expTransfer.to,
        spender: expTransfer.spender,
        feeAccount: feeAccount
    });

    let tx, txName;
    if (isNoFeeTest) {
        txName = "transferFromNoFee";
        tx = await tokenAce.transferFromNoFee(
            expTransfer.from,
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            {
                from: expTransfer.spender
            }
        );
    } else if (expTransfer.narrative === "") {
        txName = "transferFrom";
        tx = await tokenAce.transferFrom(expTransfer.from, expTransfer.to, expTransfer.amount, {
            from: expTransfer.spender
        });
    } else {
        txName = "transferFromWithNarrative";
        tx = await tokenAce.transferFromWithNarrative(
            expTransfer.from,
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            {
                from: expTransfer.spender
            }
        );
    }
    testHelper.logGasUse(testInstance, tx, txName);

    await transferEventAsserts(expTransfer);

    const allowanceAfter = await tokenAce.allowance(expTransfer.from, expTransfer.spender);
    assert.equal(
        allowanceBefore.sub(expTransfer.amount).toString(),
        allowanceAfter.toString(),
        "allowance should be reduced with transferred amount"
    );

    await assertBalances(balBefore, {
        from: {
            ace: balBefore.from.ace.minus(expTransfer.amount).minus(expTransfer.fee),
            eth: balBefore.from.eth
        },
        to: {
            ace: balBefore.to.ace.plus(expTransfer.amount),
            eth: balBefore.to.eth,
            gasFee: expTransfer.to === expTransfer.spender ? TRANSFER_MAXFEE : 0
        },
        spender: {
            ace: balBefore.spender.ace.plus(expTransfer.to === expTransfer.spender ? expTransfer.amount : 0),
            eth: balBefore.spender.eth,
            gasFee: TRANSFER_MAXFEE
        },
        feeAccount: {
            ace: balBefore.feeAccount.ace.plus(expTransfer.fee),
            eth: balBefore.feeAccount.eth
        }
    });
}

async function getTransferFee(_amount) {
    let feePt, feeMin, feeMax;
    let amount = new BigNumber(_amount);

    await Promise.all([
        (feePt = await tokenAce.transferFeePt()),
        (feeMax = await tokenAce.transferFeeMax()),
        (feeMin = await tokenAce.transferFeeMin())
    ]);
    let fee =
        amount === 0
            ? 0
            : amount
                  .mul(feePt)
                  .div(1000000)
                  .round(0, BigNumber.ROUND_DOWN);
    if (fee < feeMin) {
        fee = feeMin;
    } else if (fee > feeMax) {
        fee = feeMax;
    }
    // console.log("calc fee", _amount, feeMin.toString(), fee.toString());
    return fee;
}

async function getAllBalances(accs) {
    const ret = {};
    for (const ac of Object.keys(accs)) {
        const address = accs[ac].address ? accs[ac].address : accs[ac];
        ret[ac] = {};
        ret[ac].address = address;
        ret[ac].eth = await web3.eth.getBalance(address);
        ret[ac].ace = await tokenAce.balanceOf(address);
    }

    return ret;
}

async function assertBalances(before, exp) {
    // get addresses from before arg
    for (const ac of Object.keys(exp)) {
        exp[ac].address = before[ac].address;
    }
    const newBal = await getAllBalances(exp);

    for (const acc of Object.keys(newBal)) {
        if (exp[acc].gasFee && exp[acc].gasFee > 0) {
            const diff = newBal[acc].eth.sub(exp[acc].eth).abs();
            assert.isAtMost(
                diff.toNumber(),
                exp[acc].gasFee,
                `Account ${acc} ETH balance diferrence higher than expecteed gas fee`
            );
        } else {
            assert.equal(
                newBal[acc].eth.toString(),
                exp[acc].eth.toString(),
                `Account ${acc} ETH balance is not as expected`
            );
        }
        assert.equal(
            newBal[acc].ace.toString(),
            exp[acc].ace.toString(),
            `Account ${acc} ACE balance is not as expected`
        );
    }
}

async function transferEventAsserts(expTransfer) {
    await testHelper.assertEvent(tokenAce, "AugmintTransfer", {
        from: expTransfer.from,
        to: expTransfer.to,
        amount: expTransfer.amount.toString(),
        fee: expTransfer.fee.toString(),
        narrative: expTransfer.narrative
    });

    await testHelper.assertEvent(tokenAce, "Transfer", {
        from: expTransfer.from,
        to: expTransfer.to,
        amount: expTransfer.amount.toString()
    });
}

async function approveEventAsserts(expApprove) {
    await testHelper.assertEvent(tokenAce, "Approval", {
        _owner: expApprove.owner,
        _spender: expApprove.spender,
        _value: expApprove.value.toString()
    });
}
