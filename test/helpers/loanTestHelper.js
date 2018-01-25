const NEWLOAN_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const REPAY_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const COLLECT_BASEFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)

const BigNumber = require("bignumber.js");
const moment = require("moment");
const tokenAceTestHelper = require("./tokenAceTestHelper.js");
const testHelper = require("./testHelper.js");

const LoanManager = artifacts.require("./LoanManager.sol");

let tokenAce, loanManager, rates, peggedSymbol;
let reserveAcc;
let interestPoolAcc = null;
let interestEarnedAcc = null;

module.exports = {
    newLoanManagerMock,
    createLoan,
    repayLoan,
    collectLoan,
    getProductInfo,
    calcLoanValues,
    newLoanEventAsserts,
    loanAsserts
};

async function newLoanManagerMock(_tokenAce, _rates) {
    tokenAce = _tokenAce;
    peggedSymbol = web3.toAscii(await tokenAce.peggedSymbol());
    rates = _rates;
    reserveAcc = tokenAce.address;
    loanManager = await LoanManager.new(tokenAce.address, rates.address);
    loanManager.grantMultiplePermissions(web3.eth.accounts[0], ["addLoanProduct", "setLoanProductActiveState"]);
    // term (in sec), discountRate, loanCoverageRatio, minDisbursedAmount (w/ 4 decimals), defaultingFeePt, isActive
    // notDue: (due in 1 day)
    await loanManager.addLoanProduct(86400, 970000, 850000, 300000, 50000, true);
    // repaying: due in 60 sec for testing repayment
    await loanManager.addLoanProduct(60, 985000, 900000, 200000, 50000, true);
    // defaulting: due in 1 sec, repay in 1sec for testing defaults
    await loanManager.addLoanProduct(1, 990000, 600000, 100000, 50000, true);
    // defaulting no left over collateral: due in 1 sec, repay in 1sec for testing defaults without leftover
    await loanManager.addLoanProduct(1, 990000, 990000, 100000, 50000, true);
    // disabled product
    await loanManager.addLoanProduct(1, 990000, 990000, 100000, 50000, false);

    await tokenAce.grantMultiplePermissions(loanManager.address, ["issueAndDisburse", "LoanManager"]);
    interestEarnedAcc = await tokenAce.interestEarnedAccount();

    return loanManager;
}

async function createLoan(testInstance, product, borrower, collateralWei) {
    const loan = await calcLoanValues(rates, product, collateralWei);
    loan.state = 0;
    loan.borrower = borrower;

    const testedAccounts = [reserveAcc, loan.borrower, loanManager.address, interestEarnedAcc];

    const totalSupplyBefore = await tokenAce.totalSupply();
    const balBefore = await tokenAceTestHelper.getBalances(testedAccounts);

    const tx = await loanManager.newEthBackedLoan(loan.product.id, {
        from: loan.borrower,
        value: loan.collateral
    });
    testHelper.logGasUse(testInstance, tx, "newEthBackedLoan");
    loan.id = newLoanEventAsserts(tx, loan);
    await loanAsserts(loan);

    assert.equal(
        (await tokenAce.totalSupply()).toString(),
        totalSupplyBefore.add(loan.loanAmount).toString(),
        "total ACE supply should be increased by the disbursed loan amount"
    );

    let expBalances = [
        {
            name: "reserve",
            address: reserveAcc,
            ace: balBefore[0].ace,
            eth: balBefore[0].eth
        },
        {
            name: "loan.borrower",
            address: loan.borrower,
            ace: balBefore[1].ace.add(loan.loanAmount),
            eth: balBefore[1].eth.minus(loan.collateral),
            gasFee: NEWLOAN_MAXFEE
        },
        {
            name: "loanManager",
            address: loanManager.address,
            ace: balBefore[2].ace,
            eth: balBefore[2].eth.plus(loan.collateral)
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ace: balBefore[3].ace,
            eth: balBefore[3].eth
        }
    ];

    await tokenAceTestHelper.balanceAsserts(expBalances);

    return loan;
}

async function repayLoan(testInstance, loan) {
    const testedAccounts = [reserveAcc, loan.borrower, loanManager.address, interestEarnedAcc];
    const totalSupplyBefore = await tokenAce.totalSupply();
    const balBefore = await tokenAceTestHelper.getBalances(testedAccounts);

    loan.state = 1; // repaid
    const tx = await tokenAce.repayLoan(loanManager.address, loan.id, { from: loan.borrower });
    testHelper.logGasUse(testInstance, tx, "AugmintToken.repayLoan");
    // TODO: assert events (truffle is missing LoanRepayed event)

    await loanAsserts(loan);

    assert.equal(
        (await tokenAce.totalSupply()).toString(),
        totalSupplyBefore.sub(loan.loanAmount).toString(),
        "total ACE supply should be reduced by the loan amount (what was disbursed)"
    );

    let expBalances = [
        {
            name: "reserve",
            address: reserveAcc,
            ace: balBefore[0].ace,
            eth: balBefore[0].eth
        },
        {
            name: "loan.borrower",
            address: loan.borrower,
            ace: balBefore[1].ace.sub(loan.repaymentAmount),
            eth: balBefore[1].eth.add(loan.collateral),
            gasFee: REPAY_MAXFEE
        },
        {
            name: "loanManager",
            address: loanManager.address,
            ace: balBefore[2].ace,
            eth: balBefore[2].eth.minus(loan.collateral)
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ace: balBefore[3].ace.add(loan.interestAmount),
            eth: balBefore[3].eth
        }
    ];

    await tokenAceTestHelper.balanceAsserts(expBalances);
}

async function collectLoan(testInstance, loan, collector) {
    loan.collector = collector;

    const testedAccounts = [reserveAcc, loan.borrower, loan.collector, loanManager.address, interestEarnedAcc];
    const totalSupplyBefore = await tokenAce.totalSupply();
    const balBefore = await tokenAceTestHelper.getBalances(testedAccounts);
    const coveringValue = (await rates.convertToWei(peggedSymbol, loan.repaymentAmount)).add(loan.defaultingFee);
    let releasedCollateral;
    if (coveringValue < loan.collateral) {
        releasedCollateral = loan.collateral.sub(coveringValue);
    } else {
        releasedCollateral = 0;
    }
    const collectedCollateral = loan.collateral.sub(releasedCollateral);
    loan.state = 2; // defaulted

    const tx = await loanManager.collect([loan.id], { from: loan.collector });
    testHelper.logGasUse(testInstance, tx, "collect 1");
    /* Truffle/web3 doesn't pick up event from other contract? (it's emmitted but not in tx.logs)
    assert.equal(tx.logs[0].event, "Transfer", "Transfer event should be emited for burn");
    assert.equal(tx.logs[0].args.to, "0x0", "to should be 0x0 in trasnfer event");
    assert.equal(tx.logs[0].args.amount.toString(), loan.interestAmount, "interestAmount should be set in Transfer event");
    */
    let log = tx.logs[0];
    assert.equal(log.event, "LoanCollected", "LoanCollected event should be emited");
    assert.equal(log.args.loanId.toNumber(), loan.id, "loanId in LoanCollected event should be set");
    assert.equal(log.args.borrower, loan.borrower, "borrower in LoanCollected event should be set");
    assert.equal(
        log.args.collectedCollateral.toString(),
        collectedCollateral.toString(),
        "collectedCollateral in LoanCollected event should be set"
    );
    assert.equal(
        log.args.releasedCollateral.toString(),
        releasedCollateral.toString(),
        "releasedCollateral in LoanCollected event should be set"
    );
    assert.equal(
        log.args.defaultingFee.toString(),
        loan.defaultingFee.toString(),
        "defaultingFee in LoanCollected event should be set"
    );

    await loanAsserts(loan);

    assert.equal(
        (await tokenAce.totalSupply()).toString(),
        totalSupplyBefore.toString(),
        "totalSupply should be the same"
    );

    let expBalances = [
        {
            name: "reserve",
            address: reserveAcc,
            ace: balBefore[0].ace,
            eth: balBefore[0].eth.add(collectedCollateral)
        },
        {
            name: "loan.borrower",
            address: loan.borrower,
            ace: balBefore[1].ace,
            eth: balBefore[1].eth.add(releasedCollateral)
        },
        {
            name: "loan.collector", // collect tx calling acc
            address: loan.collector,
            ace: balBefore[2].ace,
            eth: balBefore[2].eth,
            gasFee: COLLECT_BASEFEE
        },
        {
            name: "loanManager",
            address: loanManager.address,
            ace: balBefore[3].ace,
            eth: balBefore[3].eth.minus(loan.collateral)
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ace: balBefore[4].ace,
            eth: balBefore[4].eth
        }
    ];

    await tokenAceTestHelper.balanceAsserts(expBalances);
}

async function getProductInfo(productId) {
    let prod = await loanManager.products(productId);
    let info = {
        id: productId,
        term: prod[0],
        discountRate: prod[1],
        collateralRatio: prod[2],
        minDisbursedAmount: prod[3],
        defaultingFeePt: prod[4],
        isActive: prod[5]
    };
    return info;
}

async function calcLoanValues(rates, product, collateralWei) {
    let ret = {};

    ret.collateral = new BigNumber(collateralWei);

    // LoanManager contract code :
    // calculate loan values based on ETH sent in with Tx
    // uint tokenValue = rates.convertFromWei(augmintToken.peggedSymbol(), msg.value);
    // uint repaymentAmount = tokenValue.mul(products[productId].collateralRatio).roundedDiv(100000000);
    // repaymentAmount = repaymentAmount * 100;  // rounding 4 decimals value to 2 decimals.
    ret.tokenValue = await rates.convertFromWei(peggedSymbol, collateralWei);
    ret.repaymentAmount = ret.tokenValue
        .mul(product.collateralRatio)
        .div(100000000)
        .round(0, BigNumber.ROUND_HALF_UP)
        .mul(100);

    // LoanManager contract code :
    // uint mul = products[productId].collateralRatio.mul(products[productId].discountRate) / 1000000;
    // uint loanAmount = tokenValue.mul(mul).roundedDiv(100000000);
    // loanAmount = loanAmount * 100;
    ret.loanAmount = product.collateralRatio
        .mul(product.discountRate)
        .div(1000000)
        .round(0, BigNumber.ROUND_DOWN)
        .mul(ret.tokenValue)
        .div(100000000)
        .round(0, BigNumber.ROUND_HALF_UP)
        .mul(100);

    ret.interestAmount = ret.repaymentAmount.minus(ret.loanAmount);
    ret.disbursementTime = moment()
        .utc()
        .unix();
    ret.defaultingFee = ret.collateral
        .mul(product.defaultingFeePt)
        .div(1000000)
        .round(0, BigNumber.ROUND_DOWN);
    ret.product = product;
    return ret;
}

function newLoanEventAsserts(tx, expLoan) {
    assert.equal(tx.logs[0].event, "NewLoan", "NewLoan event should be emited");
    assert.equal(
        tx.logs[0].args.productId.toString(),
        expLoan.product.id.toString(),
        "productId in NewLoan event should be set"
    );
    assert.equal(tx.logs[0].args.productId.toNumber(), expLoan.product.id, "productId in NewLoan event should be set");
    const loanId = tx.logs[0].args.loanId.toNumber();
    assert.isNumber(loanId, "loanId in NewLoan event should be set");
    assert.equal(tx.logs[0].args.borrower, expLoan.borrower, "borrower in NewLoan event should be set");
    assert.equal(
        tx.logs[0].args.collateralAmount.toString(),
        expLoan.collateral.toString(),
        "collateralAmount in NewLoan event should be set"
    );
    assert.equal(
        tx.logs[0].args.loanAmount.toString(),
        expLoan.loanAmount.toString(),
        "loanAmount in NewLoan event should be set"
    );
    assert.equal(
        tx.logs[0].args.repaymentAmount.toString(),
        expLoan.repaymentAmount.toString(),
        "loanAmount in NewLoan event should be set"
    );
    /* TODO: truffle doesn't parse other event into tx.logs[1] - depsite it's in tx.receipt.logs in raw format
        assert.equal(
            tx.logs[1].event,
            "Transfer",
            "Transfer event should be emitted"
        );
        assert.equal(
            tx.logs[1].args.amount.toString(),
            disbursedAmount.toString(),
            "amount in Transfer event should be set"
        );
        // TODO: other event args
        */

    return loanId;
}

async function loanAsserts(expLoan) {
    const loan = await loanManager.loans(expLoan.id);
    assert.equal(loan[0], expLoan.borrower, "borrower should be set");
    assert.equal(loan[1].toNumber(), expLoan.state, "loan state should be set");
    assert.equal(loan[2].toString(), expLoan.collateral.toString(), "collateralAmount should be set");
    assert.equal(loan[3].toString(), expLoan.repaymentAmount.toString(), "repaymentAmount should be set");
    assert.equal(loan[4].toString(), expLoan.loanAmount.toString(), "loanAmount should be set");
    assert.equal(loan[5].toString(), expLoan.interestAmount.toString(), "interestAmount should be set");
    assert.equal(loan[6].toString(), expLoan.product.term.toString(), "term should be set");

    const disbursementTimeActual = loan[7];
    assert(
        disbursementTimeActual >= expLoan.disbursementTime,
        "disbursementDate should be at least the time at disbursement"
    );
    assert(
        disbursementTimeActual <= expLoan.disbursementTime + 2,
        "disbursementDate should be at most the time at disbursement + 2. Difference is: " +
            (disbursementTimeActual - expLoan.disbursementTime)
    );

    assert.equal(
        loan[8].toString(),
        disbursementTimeActual.add(expLoan.product.term),
        "maturity should be at disbursementDate + term"
    );

    assert.equal(loan[9].toString(), expLoan.product.defaultingFeePt.toString(), "defaultingFeePt should be set");
    // TODO: test loanManager.getLoanIds and .mLoans
}
