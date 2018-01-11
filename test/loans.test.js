const Rates = artifacts.require("./Rates.sol");
const loanTestHelper = require("./helpers/loanTestHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const ratesTestHelper = require("./helpers/ratesTestHelper.js");
const testHelper = require("./helpers/testHelper.js");

let tokenAce, loanManager, rates, products;

contract("ACE Loans tests", accounts => {
    before(async function() {
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        rates = await ratesTestHelper.newRatesMock("EUR", 9980000);
        loanManager = await loanTestHelper.newLoanManager(tokenAce, rates);
        await tokenAce.issue(1000000000);
        await tokenAce.withdrawTokens(accounts[0], 1000000000);
        products = {
            defaultingNoLeftOver: await loanTestHelper.getProductInfo(3),
            defaulting: await loanTestHelper.getProductInfo(2),
            repaying: await loanTestHelper.getProductInfo(1),
            notDue: await loanTestHelper.getProductInfo(0)
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

    it("Should get an ACE loan", async function() {
        await loanTestHelper.createLoan(this, products.repaying, accounts[0], web3.toWei(0.5));
    });

    it("Should NOT collect a loan before it's due");
    it("Should NOT repay an ACE loan on maturity if ACE balance is insufficient");
    it("Only owner should repay a loan when it's due");
    it("Only owner should releaseCollateral when it's due");
    it("Should not repay with invalid loanId");

    it("Should repay an ACE loan before maturity", async function() {
        const loan = await loanTestHelper.createLoan(this, products.notDue, accounts[1], web3.toWei(0.5));
        // send interest to borrower to have enough ACE to repay in test
        await tokenAce.transfer(loan.borrower, loan.interestAmount, {
            from: accounts[0]
        });

        await loanTestHelper.repayLoan(this, loan, true); // repaymant via AugmintToken.repayLoan convenience func
    });

    it("Should repay a loan directly via loanManager", async function() {
        const loan = await loanTestHelper.createLoan(this, products.notDue, accounts[1], web3.toWei(0.5));

        // send interest to borrower to have enough ACE to repay in test
        await tokenAce.transfer(loan.borrower, loan.interestAmount, {
            from: accounts[0]
        });

        await loanTestHelper.repayLoan(this, loan, false); // repayment via AugmintToken.approve + LoanManager.releaseCollateral
    });

    it("Should collect a defaulted ACE loan and send back leftover collateral", async function() {
        const loan = await loanTestHelper.createLoan(this, products.defaulting, accounts[1], web3.toWei(0.5));

        await testHelper.waitForTimeStamp((await loanManager.loans(loan.id))[8].toNumber());

        await loanTestHelper.collectLoan(this, loan, accounts[2]);
    });

    it("Should collect a defaulted ACE loan when no leftover collateral", async function() {
        const loan = await loanTestHelper.createLoan(this, products.defaultingNoLeftOver, accounts[1], web3.toWei(2));

        await testHelper.waitForTimeStamp((await loanManager.loans(loan.id))[8].toNumber());

        await loanTestHelper.collectLoan(this, loan, accounts[2]);
    });

    it("Should NOT repay a loan after paymentperiod is over");

    it("Should NOT collect an already collected ACE loan");

    it("Should collect multiple defaulted ACE loans ");

    it("Should get and repay a loan with colletaralRatio = 1");
    it("Should get and repay a loan with colletaralRatio > 1");
    it("Should get and collect a loan with colletaralRatio = 1");
    it("Should get and collect a loan with colletaralRatio > 1");
});
