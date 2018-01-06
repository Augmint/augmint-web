const NEWLOAN_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const REPAY_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const COLLECT_BASEFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)

const BigNumber = require("bignumber.js");
const moment = require("moment");
const tokenAcdTestHelper = require("./tokenUcdTestHelper.js");
const testHelper = require("./testHelper.js");

const LoanManager = artifacts.require("./loanManager.sol");

let tokenAcd, loanManager, rates;
let reserveAcc;
let interestPoolAcc = null;
let interestEarnedAcc = null;

module.exports = {
    newLoanManager,
    createLoan,
    repayLoan,
    collectLoan,
    getProductInfo,
    calcLoanValues,
    newLoanEventAsserts,
    loanAsserts
};

async function newLoanManager(_tokenAcd, _rates) {
    tokenAcd = _tokenAcd;
    rates = _rates;
    reserveAcc = tokenAcd.address;
    loanManager = await LoanManager.new(tokenAcd.address, rates.address);
    // notDue: (due in 1 day)
    await loanManager.addProduct(86400, 970000, 850000, 300000, true);

    // repaying: due in 1 sec, repay in 1hr for testing repayments
    await loanManager.addProduct(1, 985000, 900000, 200000, true);
    // defaulting: due in 1 sec, repay in 1sec for testing defaults
    await loanManager.addProduct(1, 990000, 950000, 100000, true);
    await tokenAcd.grantMultiplePermissions(loanManager.address, [
        "issueAndDisburse",
        "repayAndBurn",
        "moveCollectedInterest",
        "LoanManager"
    ]);
    interestPoolAcc = await tokenAcd.interestPoolAccount();
    interestEarnedAcc = await tokenAcd.interestEarnedAccount();

    return loanManager;
}

async function createLoan(testInstance, product, borrower, collateralWei) {
    const loan = await calcLoanValues(rates, product, collateralWei);
    loan.state = 0;
    loan.borrower = borrower;

    const testedAccounts = [reserveAcc, loan.borrower, loanManager.address, interestPoolAcc, interestEarnedAcc];

    const totalSupplyBefore = await tokenAcd.totalSupply();
    const balBefore = await tokenAcdTestHelper.getBalances(testedAccounts);

    const tx = await loanManager.newEthBackedLoan(loan.product.id, {
        from: loan.borrower,
        value: loan.collateral
    });
    testHelper.logGasUse(testInstance, tx, "newEthBackedLoan");
    loan.id = newLoanEventAsserts(tx, loan);
    await loanAsserts(loan);

    assert.equal(
        (await tokenAcd.totalSupply()).toString(),
        totalSupplyBefore.add(loan.repaymentAmount).toString(),
        "total ACD supply should be increased by the loan amount"
    );

    let expBalances = [
        {
            name: "reserve",
            address: reserveAcc,
            ucd: balBefore[0].ucd,
            eth: balBefore[0].eth
        },
        {
            name: "loan.borrower",
            address: loan.borrower,
            ucd: balBefore[1].ucd.add(loan.loanAmount),
            eth: balBefore[1].eth.minus(loan.collateral),
            gasFee: NEWLOAN_MAXFEE
        },
        {
            name: "loanManager",
            address: loanManager.address,
            ucd: balBefore[2].ucd,
            eth: balBefore[2].eth.plus(loan.collateral)
        },
        {
            name: "interestPool Acc",
            address: interestPoolAcc,
            ucd: balBefore[3].ucd.add(loan.interestAmount),
            eth: balBefore[3].eth
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ucd: balBefore[4].ucd,
            eth: balBefore[4].eth
        }
    ];

    await tokenAcdTestHelper.balanceAsserts(expBalances);

    return loan;
}

async function repayLoan(testInstance, loan, viaToken = true) {
    const testedAccounts = [reserveAcc, loan.borrower, loanManager.address, interestPoolAcc, interestEarnedAcc];
    const totalSupplyBefore = await tokenAcd.totalSupply();
    const balBefore = await tokenAcdTestHelper.getBalances(testedAccounts);

    loan.state = 1; // repaid
    let tx;
    if (viaToken) {
        tx = await tokenAcd.repayLoan(loanManager.address, loan.id, { from: loan.borrower });
        testHelper.logGasUse(testInstance, tx, "AugmintToken.repayLoan");
        // TODO: assert events (truffle is missing LoanRepayed event)
    } else {
        const appTx = await tokenAcd.approve(loanManager.address, loan.repaymentAmount, { from: loan.borrower });
        testHelper.logGasUse(testInstance, appTx, "AugmintToken.approve");
        tx = await loanManager.releaseCollateral(loan.id, { from: loan.borrower });
        testHelper.logGasUse(testInstance, tx, "LoanManager.releaseCollateral");
        // TODO: assert all events, ie. TokenBurned, Transfer etc. (truffle is missing all events but LoanRepayed )
    }

    await loanAsserts(loan);

    assert.equal(
        (await tokenAcd.totalSupply()).toString(),
        totalSupplyBefore.sub(loan.repaymentAmount).toString(),
        "total ACD supply should be reduced by the repaid loan amount"
    );

    let expBalances = [
        {
            name: "reserve",
            address: reserveAcc,
            ucd: balBefore[0].ucd,
            eth: balBefore[0].eth
        },
        {
            name: "loan.borrower",
            address: loan.borrower,
            ucd: balBefore[1].ucd.sub(loan.repaymentAmount),
            eth: balBefore[1].eth.add(loan.collateral),
            gasFee: REPAY_MAXFEE
        },
        {
            name: "loanManager",
            address: loanManager.address,
            ucd: balBefore[2].ucd,
            eth: balBefore[2].eth.minus(loan.collateral)
        },
        {
            name: "interestPool Acc",
            address: interestPoolAcc,
            ucd: balBefore[3].ucd.sub(loan.interestAmount),
            eth: balBefore[3].eth
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ucd: balBefore[4].ucd.add(loan.interestAmount),
            eth: balBefore[4].eth
        }
    ];

    await tokenAcdTestHelper.balanceAsserts(expBalances);
}

async function collectLoan(testInstance, loan, collector) {
    loan.collector = collector;

    const testedAccounts = [
        reserveAcc,
        loan.borrower,
        loan.collector,
        loanManager.address,
        interestPoolAcc,
        interestEarnedAcc
    ];
    const totalSupplyBefore = await tokenAcd.totalSupply();
    const balBefore = await tokenAcdTestHelper.getBalances(testedAccounts);

    loan.state = 2; // defaulted

    const tx = await loanManager.collect([loan.id], { from: loan.collector });

    await loanAsserts(loan);
    testHelper.logGasUse(testInstance, tx, "collect 1");

    assert.equal(
        (await tokenAcd.totalSupply()).toString(),
        totalSupplyBefore.toString(),
        "total ACD supply should be the same"
    );

    let expBalances = [
        {
            name: "reserve",
            address: reserveAcc,
            ucd: balBefore[0].ucd.add(loan.interestAmount),
            eth: balBefore[0].eth.add(loan.collateral)
        },
        {
            name: "loan.borrower",
            address: loan.borrower,
            ucd: balBefore[1].ucd,
            eth: balBefore[1].eth
        },
        {
            name: "loan.collector", // collect tx calling acc
            address: loan.collector,
            ucd: balBefore[2].ucd,
            eth: balBefore[2].eth,
            gasFee: COLLECT_BASEFEE
        },
        {
            name: "loanManager",
            address: loanManager.address,
            ucd: balBefore[3].ucd,
            eth: balBefore[3].eth.minus(loan.collateral)
        },
        {
            name: "interestPool Acc",
            address: interestPoolAcc,
            ucd: balBefore[4].ucd.sub(loan.interestAmount),
            eth: balBefore[4].eth
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ucd: balBefore[5].ucd,
            eth: balBefore[5].eth
        }
    ];

    await tokenAcdTestHelper.balanceAsserts(expBalances);
}

async function getProductInfo(productId) {
    let prod = await loanManager.products(productId);
    let info = {
        id: productId,
        term: prod[0],
        discountRate: prod[1],
        collateralRatio: prod[2],
        minDisbursedAmount: prod[3],
        isActive: prod[4]
    };
    return info;
}

async function calcLoanValues(rates, product, collateralWei) {
    let ret = {};

    ret.collateral = collateralWei;

    // uint usdcValue = rates.convertWeiToUsdc(msg.value);
    // uint ucdDueAtMaturity = usdcValue.mul(products[productId].loanCollateralRatio).roundedDiv(100000000);
    // ucdDueAtMaturity = ucdDueAtMaturity * 100; // rounding 4 decimals value to 2 decimals. no safe mul needed b/c of prev divide
    ret.usdcValue = await rates.convertWeiToUsdc(collateralWei);
    ret.repaymentAmount = ret.usdcValue
        .mul(product.collateralRatio)
        .div(100000000)
        .round(0, BigNumber.ROUND_HALF_UP)
        .mul(100);

    // uint mul = products[productId].loanCollateralRatio.mul(products[productId].discountRate) / 1000000;
    // uint disbursedLoanInUcd = usdcValue.mul(mul).roundedDiv(100000000);
    // disbursedLoanInUcd = disbursedLoanInUcd * 100; /
    ret.loanAmount = product.collateralRatio
        .mul(product.discountRate)
        .div(1000000)
        .round(0, BigNumber.ROUND_DOWN)
        .mul(ret.usdcValue)
        .div(100000000)
        .round(0, BigNumber.ROUND_HALF_UP)
        .mul(100);

    ret.interestAmount = ret.repaymentAmount.minus(ret.loanAmount);
    ret.disbursementTime = moment()
        .utc()
        .unix();
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
        disbursementTimeActual <= expLoan.disbursementTime + 1,
        "disbursementDate should be at most the time at disbursement + 1"
    );

    assert.equal(
        loan[8].toString(),
        disbursementTimeActual.add(expLoan.product.term),
        "maturity should be at disbursementDate + term"
    );

    // TODO: test loanManager.getLoanIds and .mLoans
}
