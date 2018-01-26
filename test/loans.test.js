const loanTestHelper = require("./helpers/loanTestHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const ratesTestHelper = require("./helpers/ratesTestHelper.js");
const testHelper = require("./helpers/testHelper.js");

let tokenAce, loanManager, rates, products;

contract("ACE Loans tests", accounts => {
    before(async function() {
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        rates = await ratesTestHelper.newRatesMock("EUR", 9980000);
        loanManager = await loanTestHelper.newLoanManagerMock(tokenAce, rates);
        await tokenAce.issue(1000000000);
        await tokenAce.withdrawTokens(accounts[0], 1000000000);
        products = {
            disabledProduct: await loanTestHelper.getProductInfo(4),
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

    it("Should get an ACE loan", async function() {
        await loanTestHelper.createLoan(this, products.repaying, accounts[0], web3.toWei(0.5));
    });

    it("Should NOT get a loan less than minLoanAmount");

    it("Shouldn't get a loan for a disabled product", async function() {
        await testHelper.expectThrow(
            loanManager.newEthBackedLoan(products.disabledProduct.id, { from: accounts[0], value: web3.toWei(0.5) })
        );
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

    it("Shouldn't releaseCollateral directly on loanManager", async function() {
        const loan = await loanTestHelper.createLoan(this, products.notDue, accounts[1], web3.toWei(0.5));

        // send interest to borrower to have enough ACE to repay in test
        await tokenAce.transfer(loan.borrower, loan.interestAmount, {
            from: accounts[0]
        });

        await testHelper.expectThrow(loanManager.releaseCollateral(loan.id, { from: loan.borrower }));
    });

    it("Should collect a defaulted ACE loan and send back leftover collateral ", async function() {
        const loan = await loanTestHelper.createLoan(this, products.defaulting, accounts[1], web3.toWei(0.5));

        await testHelper.waitForTimeStamp((await loanManager.loans(loan.id))[8].toNumber());

        await loanTestHelper.collectLoan(this, loan, accounts[2]);
    });

    it("Should collect a defaulted ACE loan when no leftover collateral (collection exactly covered)", async function() {
        await rates.setRate("EUR", 10000000);
        const loan = await loanTestHelper.createLoan(this, products.defaultingNoLeftOver, accounts[1], web3.toWei(1));

        await Promise.all([
            rates.setRate("EUR", 9900000),
            testHelper.waitForTimeStamp((await loanManager.loans(loan.id))[8].toNumber())
        ]);

        await loanTestHelper.collectLoan(this, loan, accounts[2]);
    });

    it("Should collect a defaulted ACE loan when no leftover collateral (collection partially covered)", async function() {
        await rates.setRate("EUR", 10000000);
        const loan = await loanTestHelper.createLoan(this, products.defaultingNoLeftOver, accounts[1], web3.toWei(1));

        await Promise.all([
            rates.setRate("EUR", 9890000),
            testHelper.waitForTimeStamp((await loanManager.loans(loan.id))[8].toNumber())
        ]);

        await loanTestHelper.collectLoan(this, loan, accounts[2]);
    });

    it("Should collect a defaulted ACE loan when no leftover collateral (only fee covered)", async function() {
        await rates.setRate("EUR", 9980000);
        const loan = await loanTestHelper.createLoan(this, products.defaultingNoLeftOver, accounts[1], web3.toWei(2));
        await Promise.all([
            rates.setRate("EUR", 1),
            testHelper.waitForTimeStamp((await loanManager.loans(loan.id))[8].toNumber())
        ]);

        await loanTestHelper.collectLoan(this, loan, accounts[2]);
    });

    it("Should not collect when rate = 0", async function() {
        await rates.setRate("EUR", 9980000);
        const loan = await loanTestHelper.createLoan(this, products.defaultingNoLeftOver, accounts[1], web3.toWei(2));
        await Promise.all([
            rates.setRate("EUR", 0),
            testHelper.waitForTimeStamp((await loanManager.loans(loan.id))[8].toNumber())
        ]);

        testHelper.expectThrow(loanTestHelper.collectLoan(this, loan, accounts[2]));
    });

    it("Should get loans from offset"); // contract func to be implemented
    it("Should get loans for one account from offset"); // contract func to be implemented

    it("Should NOT repay a loan after paymentperiod is over");

    it("Should NOT collect an already collected ACE loan");

    it("Should collect multiple defaulted ACE loans ");

    it("Should get and repay a loan with colletaralRatio = 1");
    it("Should get and repay a loan with colletaralRatio > 1");
    it("Should get and collect a loan with colletaralRatio = 1");
    it("Should get and collect a loan with colletaralRatio > 1");
    it("Should not get a loan when rates = 0");
});
