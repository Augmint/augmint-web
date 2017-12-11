"use strict";
const Rates = artifacts.require("./Rates.sol");
const loanTestHelper = require("./helpers/loanTestHelper.js");
const tokenAcdTestHelper = require("./helpers/tokenUcdTestHelper.js");
const testHelper = require("./helpers/testHelper.js");

const LoanManager = artifacts.require("./loanManager.sol");

let tokenAcd, loanManager, rates, products;

contract("ACD Loans tests", accounts => {
    before(async function() {
        tokenAcd = await tokenAcdTestHelper.newTokenAcdMock();
        rates = Rates.at(Rates.address);
        loanManager = await loanTestHelper.newLoanManager(tokenAcd, rates);
        await tokenAcd.issue(1000000000);
        await tokenAcd.withdrawTokens(accounts[0], 1000000000);
        products = {
            defaulting: await loanTestHelper.getProductInfo(loanManager, 2),
            repaying: await loanTestHelper.getProductInfo(loanManager, 1),
            notDue: await loanTestHelper.getProductInfo(loanManager, 0)
        };

        // For test debug:
        // for (const key of Object.keys(products)) {
        //     console.log({
        //         product: key,
        //         id: products[key].id,
        //         term: products[key].term.toString(),
        //         repayPeriod: products[key].repayPeriod.toString()
        //     });
        // }
    });

    it("Should NOT get a loan less than minLoanAmount");

    it("Should get an ACD loan", async function() {
        await loanTestHelper.createLoan(
            this,
            products.repaying,
            accounts[0],
            web3.toWei(0.5)
        );
    });

    it("Should NOT collect a loan before it's due");
    it("Should NOT collect a loan before paymentperiod is over");
    it(
        "Should NOT repay an ACD loan on maturity if ACD balance is insufficient"
    );
    it("Only owner should repay a loan when it's due");
    it("Should not repay with invalid loanId");

    it("Should repay an ACD loan after maturity", async function() {
        const loan = await loanTestHelper.createLoan(
            this,
            products.repaying,
            accounts[1],
            web3.toWei(0.5)
        );

        // send interest to borrower to have enough ACD to repay in test
        await tokenAcd.transfer(loan.borrower, loan.interestAmount, {
            from: accounts[0]
        });

        await testHelper.waitForTimeStamp(
            loan.product.term.add(loan.disbursementTime).toNumber()
        );
        await loanTestHelper.repayLoan(this, loan);
    });

    it("Should repay an ACD loan BEFORE maturity", async function() {
        const loan = await loanTestHelper.createLoan(
            this,
            products.notDue,
            accounts[1],
            web3.toWei(0.5)
        );

        // send interest to borrower to have enough ACD to repay in test
        await tokenAcd.transfer(loan.borrower, loan.interestAmount, {
            from: accounts[0]
        });

        await loanTestHelper.repayLoan(this, loan);
    });

    it("Should collect a defaulted ACD loan", async function() {
        const loan = await loanTestHelper.createLoan(
            this,
            products.defaulting,
            accounts[1],
            web3.toWei(0.5)
        );

        await testHelper.waitForTimeStamp(
            (await loan.contract.maturity())
                .add(loan.product.repayPeriod)
                .toNumber()
        );

        await loanTestHelper.collectLoan(this, loan, accounts[2]);
    });

    it("Should NOT repay a loan after paymentperiod is over");

    it("Should NOT collect an already collected ACD loan");

    it("Should collect multiple defaulted ACD loans ");

    it("Should get and repay a loan with colletaralRatio = 1");
    it("Should get and repay a loan with colletaralRatio > 1");
    it("Should get and collect a loan with colletaralRatio = 1");
    it("Should get and collect a loan with colletaralRatio > 1");
});
