const EthBackedLoan = artifacts.require("./EthBackedLoan.sol");
const BigNumber = require("bignumber.js");
const moment = require("moment");

module.exports = {
    getProductInfo,
    calcLoanValues,
    newLoanEventAsserts,
    loanContractAsserts
};

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
            "e_transfer",
            "e_transfer event should be emitted"
        );
        assert.equal(
            tx.logs[1].args.amount.toString(),
            disbursedAmount.toString(),
            "amount in e_transfer event should be set"
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
