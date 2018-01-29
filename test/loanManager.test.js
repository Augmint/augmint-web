const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = new require("./helpers/tokenAceTestHelper.js");
const ratesTestHelper = new require("./helpers/ratesTestHelper.js");
const loanTestHelper = new require("./helpers/loanTestHelper.js");

let loanManager, tokenAce, rates;

contract("loanManager  tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock();
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        loanManager = await loanTestHelper.newLoanManagerMock(tokenAce, rates);
    });

    it("Should add new product", async function() {
        const prod = {
            term: 86400,
            discountRate: 970000,
            collateralRatio: 850000,
            minDisbursedAmount: 300000,
            defaultingFeePt: 50000,
            isActive: true
        };
        await loanManager.addLoanProduct(
            prod.term,
            prod.discountRate,
            prod.collateralRatio,
            prod.minDisbursedAmount,
            prod.defaultingFeePt,
            prod.isActive,
            { from: accounts[0] }
        );
        const res = await testHelper.assertEvent(loanManager, "LoanProductAdded", {
            productId: x => x
        });
        const prodActual = await loanTestHelper.getProductInfo(res.productId);
        Object.keys(prod).forEach(argName =>
            assert.equal(
                prodActual[argName].toString(),
                prod[argName].toString(),
                `Prod arg ${argName} expected ${prod[argName]} but has value ${prodActual[argName]}`
            )
        );
    });

    it("Only allowed should add new product", async function() {
        await testHelper.expectThrow(
            loanManager.addLoanProduct(86400, 970000, 850000, 300000, 50000, true, { from: accounts[1] })
        );
    });

    it("Should disable loan product", async function() {
        const tx = await loanManager.setLoanProductActiveState(0, false);
        testHelper.logGasUse(this, tx, "setLoanProductActiveState");
        assert.equal(
            tx.logs[0].event,
            "LoanProductActiveStateChanged",
            "LoanProductActiveStateChanged event should be emmitted"
        );
        assert(!tx.logs[0].args.newState, "new state should be false");
    });

    it("Should enable loan product", async function() {
        const tx = await loanManager.setLoanProductActiveState(4, true);
        testHelper.logGasUse(this, tx, "setLoanProductActiveState");
        assert.equal(
            tx.logs[0].event,
            "LoanProductActiveStateChanged",
            "LoanProductActiveStateChanged event should be emmitted"
        );
        assert(tx.logs[0].args.newState, "new state should be true");
    });

    it("Only allowed should set loan product state", async function() {
        await testHelper.expectThrow(loanManager.setLoanProductActiveState(0, true, { from: accounts[1] }));
    });
});
