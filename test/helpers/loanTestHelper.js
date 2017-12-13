"use strict";

const NEWLOAN_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const REPAY_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const COLLECT_BASEFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)

const BigNumber = require("bignumber.js");
const moment = require("moment");
const tokenAcdTestHelper = require("./tokenUcdTestHelper.js");
const testHelper = require("./testHelper.js");

const LoanManager = artifacts.require("./loanManager.sol");
const EthBackedLoan = artifacts.require("./EthBackedLoan.sol");

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
    loanContractAsserts
};

async function newLoanManager(_tokenAcd, _rates) {
    tokenAcd = _tokenAcd;
    rates = _rates;
    reserveAcc = tokenAcd.address;
    loanManager = await LoanManager.new(tokenAcd.address, rates.address);
    // notDue: (due in 1 day)
    await loanManager.addProduct(86400, 970000, 850000, 300000, 3600, true);

    // repaying: due in 1 sec, repay in 1hr for testing repayments
    await loanManager.addProduct(1, 985000, 900000, 200000, 3600, true);
    // defaulting: due in 1 sec, repay in 1sec for testing defaults
    await loanManager.addProduct(1, 990000, 950000, 100000, 1, true);
    await tokenAcd.grantMultiplePermissions(loanManager.address, [
        "transferNoFee",
        "issue",
        "burn"
    ]);
    interestPoolAcc = await tokenAcd.interestPoolAccount();
    interestEarnedAcc = await tokenAcd.interestEarnedAccount();

    return loanManager;
}

async function createLoan(testInstance, product, borrower, collateralWei) {
    const loan = await calcLoanValues(rates, product, collateralWei);
    loan.state = 0;
    loan.borrower = borrower;

    const testedAccounts = [
        reserveAcc,
        loan.borrower,
        interestPoolAcc,
        interestEarnedAcc
    ];

    const totalSupplyBefore = await tokenAcd.totalSupply();
    const balBefore = await tokenAcdTestHelper.getBalances(testedAccounts);

    const tx = await loanManager.newEthBackedLoan(loan.product.id, {
        from: loan.borrower,
        value: loan.collateral
    });

    loan.contract = newLoanEventAsserts(tx, loan);
    loan.id = await loan.contract.loanId();

    await loanContractAsserts(loan.contract, loan);
    testHelper.logGasUse(testInstance, tx, "newEthBackedLoan");

    assert.equal(
        (await tokenAcd.totalSupply()).toString(),
        totalSupplyBefore.add(loan.loanAmount).toString(),
        "total ACD supply should be increased by the loan amount"
    );

    assert.equal(
        (await web3.eth.getBalance(loan.contract.address)).toString(),
        loan.collateral.toString(),
        "collateral ETH should be in loanContract"
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
            ucd: balBefore[1].ucd.add(loan.disbursedAmount),
            eth: balBefore[1].eth.minus(loan.collateral),
            gasFee: NEWLOAN_MAXFEE
        },
        {
            name: "interestPool Acc",
            address: interestPoolAcc,
            ucd: balBefore[2].ucd.add(loan.interestAmount),
            eth: balBefore[2].eth
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ucd: balBefore[3].ucd,
            eth: balBefore[3].eth
        }
    ];

    await tokenAcdTestHelper.balanceAsserts(expBalances);

    return loan;
}

async function repayLoan(testInstance, loan) {
    const testedAccounts = [
        reserveAcc,
        loan.borrower,
        interestPoolAcc,
        interestEarnedAcc
    ];
    const totalSupplyBefore = await tokenAcd.totalSupply();
    const balBefore = await tokenAcdTestHelper.getBalances(testedAccounts);

    loan.state = 1; // repaid

    const tx = await loanManager.repay(loan.id, { from: loan.borrower });
    await loanContractAsserts(loan.contract, loan);
    testHelper.logGasUse(testInstance, tx, "repay");

    assert.equal(
        (await tokenAcd.totalSupply()).toString(),
        totalSupplyBefore.sub(loan.loanAmount).toString(),
        "total ACD supply should be reduced by the repaid loan amount"
    );

    assert.equal(
        (await web3.eth.getBalance(loan.contract.address)).toString(),
        "0",
        "collateral ETH in loanContract should be 0"
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
            ucd: balBefore[1].ucd.sub(loan.loanAmount),
            eth: balBefore[1].eth.add(loan.collateral),
            gasFee: REPAY_MAXFEE
        },
        {
            name: "interestPool Acc",
            address: interestPoolAcc,
            ucd: balBefore[2].ucd.sub(loan.interestAmount),
            eth: balBefore[2].eth
        },
        {
            name: "interestEarned Acc",
            address: interestEarnedAcc,
            ucd: balBefore[3].ucd.add(loan.interestAmount),
            eth: balBefore[3].eth
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
        interestPoolAcc,
        interestEarnedAcc
    ];
    const totalSupplyBefore = await tokenAcd.totalSupply();
    const balBefore = await tokenAcdTestHelper.getBalances(testedAccounts);

    loan.state = 2; // defaulted

    const tx = await loanManager.collect([loan.id], { from: loan.collector });

    await loanContractAsserts(loan.contract, loan);
    testHelper.logGasUse(testInstance, tx, "collect 1");

    assert.equal(
        (await tokenAcd.totalSupply()).toString(),
        totalSupplyBefore.toString(),
        "total ACD supply should be the same"
    );

    assert.equal(
        (await web3.eth.getBalance(loan.contract.address)).toString(),
        "0",
        "collateral ETH in loanContract should be 0"
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
            name: "interestPool Acc",
            address: interestPoolAcc,
            ucd: balBefore[3].ucd.sub(loan.interestAmount),
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
}

async function getProductInfo(loanManager, productId) {
    let prod = await loanManager.products(productId);
    let info = {
        id: productId,
        term: prod[0],
        discountRate: prod[1],
        collateralRatio: prod[2],
        minDisbursedAmount: prod[3],
        repayPeriod: prod[4],
        isActive: prod[5]
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
    ret.loanAmount = ret.usdcValue
        .mul(product.collateralRatio)
        .div(100000000)
        .round(0, BigNumber.ROUND_HALF_UP)
        .mul(100);

    // uint mul = products[productId].loanCollateralRatio.mul(products[productId].discountRate) / 1000000;
    // uint disbursedLoanInUcd = usdcValue.mul(mul).roundedDiv(100000000);
    // disbursedLoanInUcd = disbursedLoanInUcd * 100; /
    ret.disbursedAmount = product.collateralRatio
        .mul(product.discountRate)
        .div(1000000)
        .round(0, BigNumber.ROUND_DOWN)
        .mul(ret.usdcValue)
        .div(100000000)
        .round(0, BigNumber.ROUND_HALF_UP)
        .mul(100);

    ret.interestAmount = ret.loanAmount.minus(ret.disbursedAmount);
    ret.disbursementTime = moment()
        .utc()
        .unix();
    ret.product = product;
    return ret;
}

function newLoanEventAsserts(tx, expLoan) {
    assert.equal(
        tx.logs[0].event,
        "e_newLoan",
        "e_newLoan event should be emited"
    );
    assert.equal(
        tx.logs[0].args.productId.toString(),
        expLoan.product.id.toString(),
        "productId in e_newLoan event should be set"
    );

    let loanId = tx.logs[0].args.loanId.toNumber();
    assert.isNumber(loanId, "loanId in e_newLoan event should be set");
    assert.equal(
        tx.logs[0].args.borrower,
        expLoan.borrower,
        "borrower in e_newLoan event should be set"
    );
    let loanContractAddress = tx.logs[0].args.loanContract;
    assert(
        web3.isAddress(loanContractAddress),
        "loanContract in e_newLoan event should be set"
    );
    assert.equal(
        tx.logs[0].args.disbursedLoanInUcd.toString(),
        expLoan.disbursedAmount.toString(),
        "disbursedLoanInUcd in e_newLoan event should be set"
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

    return EthBackedLoan.at(loanContractAddress);
}

async function loanContractAsserts(loanContract, expLoan) {
    assert.equal(
        (await loanContract.loanState()).toNumber(),
        expLoan.state,
        "loanContract.loanState should be as expected"
    );

    assert.equal(
        (await loanContract.ucdDueAtMaturity()).toString(),
        expLoan.loanAmount.toString(),
        "loanContract.ucdDueAtMaturity should be the loan amount "
    );

    assert.equal(
        (await loanContract.disbursedLoanInUcd()).toString(),
        expLoan.disbursedAmount.toString(),
        "loanContract.disbursedLoanInUcd should be the disbursed amount "
    );

    assert.equal(
        (await loanContract.term()).toString(),
        expLoan.product.term.toString(),
        "loanContract.term should be the product's term"
    );
    let disbursementTimeActual = await loanContract.disbursementDate();
    assert(
        disbursementTimeActual >= expLoan.disbursementTime,
        "loanContract.disbursementDate should be at least the time at disbursement"
    );
    assert(
        disbursementTimeActual <= expLoan.disbursementTime + 1,
        "loanContract.disbursementDate should be at most the time at disbursement + 1"
    );

    assert.equal(
        (await loanContract.maturity()).toString(),
        disbursementTimeActual.add(expLoan.product.term),
        "loanContract.maturity should be at disbursementDate + term"
    );

    assert.equal(
        (await loanContract.repayPeriod()).toString(),
        expLoan.product.repayPeriod.toString(),
        "loanContract.repayPeriod should be the product's repayPeriod"
    );

    // TODO: loanManager.getLoanIds, .m_loanPointers, .loanPointers.contractAddress .loanpointer.loanState
}
