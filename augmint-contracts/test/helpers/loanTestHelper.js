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
    rates = _rates;
    reserveAcc = tokenAce.address;
    loanManager = await LoanManager.new(tokenAce.address, rates.address);

    [interestEarnedAcc, peggedSymbol, , ,] = await Promise.all([
        tokenAce.interestEarnedAccount(),

        tokenAce.peggedSymbol(),

        tokenAce.grantMultiplePermissions(loanManager.address, ["NoFeeTransferContracts", "LoanManagerContracts"]),

        loanManager.grantMultiplePermissions(web3.eth.accounts[0], ["MonetaryBoard"])
    ]);

    peggedSymbol = web3.toAscii(peggedSymbol);
    // These neeed to be sequantial b/c ids hardcoded in tests.
    // term (in sec), discountRate, loanCoverageRatio, minDisbursedAmount (w/ 4 decimals), defaultingFeePt, isActive
    // notDue: (due in 1 day)
    await loanManager.addLoanProduct(86400, 970000, 850000, 300000, 50000, true);
    // repaying: due in 60 sec for testing repayment
    await loanManager.addLoanProduct(60, 985000, 900000, 200000, 50000, true);
    // defaulting: due in 1 sec, repay in 1sec for testing defaults
    await loanManager.addLoanProduct(1, 990000, 600000, 100000, 50000, true);
    // defaulting no left over collateral: due in 1 sec, repay in 1sec for testing defaults without leftover
    await loanManager.addLoanProduct(1, 900000, 900000, 100000, 100000, true);
    // disabled product
    await loanManager.addLoanProduct(1, 990000, 990000, 100000, 50000, false);

    return loanManager;
}

async function createLoan(testInstance, product, borrower, collateralWei) {
    const loan = await calcLoanValues(rates, product, collateralWei);
    loan.state = 0;
    loan.borrower = borrower;

    const totalSupplyBefore = await tokenAce.totalSupply();
    const balBefore = await tokenAceTestHelper.getAllBalances({
        reserve: reserveAcc,
        borrower: loan.borrower,
        loanManager: loanManager.address,
        interestEarned: interestEarnedAcc
    });

    const tx = await loanManager.newEthBackedLoan(loan.product.id, {
        from: loan.borrower,
        value: loan.collateral
    });
    testHelper.logGasUse(testInstance, tx, "newEthBackedLoan");
    loan.id = await newLoanEventAsserts(loan);

    const [totalSupplyAfter, ,] = await Promise.all([
        tokenAce.totalSupply(),

        loanAsserts(loan),

        tokenAceTestHelper.assertBalances(balBefore, {
            reserve: {
                ace: balBefore.reserve.ace,
                eth: balBefore.reserve.eth
            },
            borrower: {
                ace: balBefore.borrower.ace.add(loan.loanAmount),
                eth: balBefore.borrower.eth.minus(loan.collateral),
                gasFee: NEWLOAN_MAXFEE
            },
            loanManager: {
                ace: balBefore.loanManager.ace,
                eth: balBefore.loanManager.eth.plus(loan.collateral)
            },
            interestEarned: {
                ace: balBefore.interestEarned.ace,
                eth: balBefore.interestEarned.eth
            }
        })
    ]);

    assert.equal(
        totalSupplyAfter.toString(),
        totalSupplyBefore.add(loan.loanAmount).toString(),
        "total ACE supply should be increased by the disbursed loan amount"
    );

    return loan;
}

async function repayLoan(testInstance, loan) {
    const totalSupplyBefore = await tokenAce.totalSupply();
    const balBefore = await tokenAceTestHelper.getAllBalances({
        reserve: reserveAcc,
        borrower: loan.borrower,
        loanManager: loanManager.address,
        interestEarned: interestEarnedAcc
    });

    loan.state = 1; // repaid
    const tx = await tokenAce.repayLoan(loanManager.address, loan.id, { from: loan.borrower });
    testHelper.logGasUse(testInstance, tx, "AugmintToken.repayLoan");

    const [totalSupplyAfter, , , ,] = await Promise.all([
        tokenAce.totalSupply(),

        testHelper.assertEvent(loanManager, "LoanRepayed", {
            loanId: loan.id,
            borrower: loan.borrower
        }),

        testHelper.assertEvent(tokenAce, "AugmintTransfer", {
            from: loan.borrower,
            to: tokenAce.address,
            amount: loan.repaymentAmount.toString(),
            fee: 0,
            narrative: "Loan repayment"
        }),

        // TODO: it's emmited  but why not picked up by assertEvent?
        // testHelper.assertEvent(tokenAce, "Transfer", {
        //     from: loan.borrower,
        //     to: tokenAce.address,
        //     amount: loan.repaymentAmount.toString()
        // }),

        loanAsserts(loan),

        tokenAceTestHelper.assertBalances(balBefore, {
            reserve: {
                ace: balBefore.reserve.ace,
                eth: balBefore.reserve.eth
            },
            borrower: {
                ace: balBefore.borrower.ace.sub(loan.repaymentAmount),
                eth: balBefore.borrower.eth.add(loan.collateral),
                gasFee: REPAY_MAXFEE
            },
            loanManager: {
                ace: balBefore.loanManager.ace,
                eth: balBefore.loanManager.eth.minus(loan.collateral)
            },
            interestEarned: {
                ace: balBefore.interestEarned.ace.add(loan.interestAmount),
                eth: balBefore.interestEarned.eth
            }
        })
    ]);

    assert.equal(
        totalSupplyAfter.toString(),
        totalSupplyBefore.sub(loan.loanAmount).toString(),
        "total ACE supply should be reduced by the loan amount (what was disbursed)"
    );
}

async function collectLoan(testInstance, loan, collector) {
    loan.collector = collector;
    loan.state = 2; // defaulted

    const targetCollectionInToken = loan.repaymentAmount.mul(loan.product.defaultingFeePt.add(1000000)).div(1000000);
    const targetFeeInToken = loan.repaymentAmount.mul(loan.product.defaultingFeePt).div(1000000);
    //.round(0, BigNumber.ROUND_DOWN);

    const [
        totalSupplyBefore,
        balBefore,
        collateralInToken,
        repaymentAmountInWei,
        targetCollectionInWei,
        targetFeeInWei
    ] = await Promise.all([
        tokenAce.totalSupply(),

        tokenAceTestHelper.getAllBalances({
            reserve: reserveAcc,
            collector: loan.collector,
            borrower: loan.borrower,
            loanManager: loanManager.address,
            interestEarned: interestEarnedAcc
        }),
        rates.convertFromWei(peggedSymbol, loan.collateral),
        rates.convertToWei(peggedSymbol, loan.repaymentAmount),
        rates.convertToWei(peggedSymbol, targetCollectionInToken),
        rates.convertToWei(peggedSymbol, targetFeeInToken)
    ]);

    const releasedCollateral = BigNumber.max(loan.collateral.sub(targetCollectionInWei), 0);
    const collectedCollateral = loan.collateral.sub(releasedCollateral);
    const defaultingFee = BigNumber.min(targetFeeInWei, collectedCollateral);

    const rate = await rates.rates("EUR");
    // console.log(
    //     `    *** Collection params:
    //      A-EUR/EUR: ${rate[0] / 10000}
    //      defaulting fee pt: ${loan.product.defaultingFeePt / 10000} %
    //      repaymentAmount: ${loan.repaymentAmount / 10000} A-EUR = ${web3.fromWei(repaymentAmountInWei)} ETH
    //      collateral: ${web3.fromWei(loan.collateral).toString()} ETH = ${collateralInToken / 10000} A-EUR
    //      --------------------
    //      targetFee: ${targetFeeInToken / 10000} A-EUR = ${web3.fromWei(targetFeeInWei).toString()} ETH
    //      target collection : ${targetCollectionInToken / 10000} A-EUR = ${web3
    //         .fromWei(targetCollectionInWei)
    //         .toString()} ETH
    //      collected: ${web3.fromWei(collectedCollateral).toString()} ETH
    //      released: ${web3.fromWei(releasedCollateral).toString()} ETH
    //      defaultingFee: ${web3.fromWei(defaultingFee).toString()} ETH`
    // );

    const tx = await loanManager.collect([loan.id], { from: loan.collector });
    testHelper.logGasUse(testInstance, tx, "collect 1");

    const [totalSupplyAfter, , ,] = await Promise.all([
        tokenAce.totalSupply(),

        testHelper.assertEvent(loanManager, "LoanCollected", {
            loanId: loan.id,
            borrower: loan.borrower,
            collectedCollateral: collectedCollateral.toString(),
            releasedCollateral: releasedCollateral.toString(),
            defaultingFee: defaultingFee.toString()
        }),

        loanAsserts(loan),

        tokenAceTestHelper.assertBalances(balBefore, {
            reserve: {
                ace: balBefore.reserve.ace,
                eth: balBefore.reserve.eth.add(collectedCollateral)
            },

            collector: {
                ace: balBefore.collector.ace,
                eth: balBefore.collector.eth,
                gasFee: COLLECT_BASEFEE
            },

            borrower: {
                ace: balBefore.borrower.ace,
                eth: balBefore.borrower.eth.add(releasedCollateral),
                gasFee: REPAY_MAXFEE
            },

            loanManager: {
                ace: balBefore.loanManager.ace,
                eth: balBefore.loanManager.eth.minus(loan.collateral)
            },

            interestEarned: {
                ace: balBefore.interestEarned.ace,
                eth: balBefore.interestEarned.eth
            }
        })
    ]);

    assert.equal(totalSupplyAfter.toString(), totalSupplyBefore.toString(), "totalSupply should be the same");
}

async function getProductInfo(productId) {
    const prod = await loanManager.products(productId);
    const info = {
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
    const ret = {};

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
    ret.product = product;
    return ret;
}

async function newLoanEventAsserts(expLoan) {
    const [eventResults, ,] = await Promise.all([
        testHelper.assertEvent(loanManager, "NewLoan", {
            loanId: x => x,
            productId: expLoan.product.id,
            borrower: expLoan.borrower,
            collateralAmount: expLoan.collateral.toString(),
            loanAmount: expLoan.loanAmount.toString(),
            repaymentAmount: expLoan.repaymentAmount.toString()
        }),

        testHelper.assertEvent(tokenAce, "AugmintTransfer", {
            from: tokenAce.address,
            to: expLoan.borrower,
            amount: expLoan.loanAmount.toString(),
            fee: 0,
            narrative: "Loan disbursement"
        })

        // TODO: it's emmited  but why  not picked up by assertEvent?
        // testHelper.assertEvent(tokenAce, "Transfer", {
        //     from: tokenAce.address,
        //     to: expLoan.borrower,
        //     amount: expLoan.loanAmount.toString()
        // })
    ]);

    return eventResults.loanId.toNumber();
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
}
