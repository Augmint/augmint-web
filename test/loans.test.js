const loanTestHelper = new require("./helpers/loanTestHelper.js");
const tokenUcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");
const Rates = artifacts.require("./Rates.sol");
const LoanManager = artifacts.require("./loanManager.sol");
const TokenUcd = artifacts.require("./TokenAcd.sol");
const NEWLOAN_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const REPAY_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)

const acc0 = web3.eth.accounts[0],
    acc1 = web3.eth.accounts[1];

const collateralWei = web3.toWei(0.5);
let tokenUcd, loanManager, rates, products;
let balBefore, totalSupplyBefore;

contract("ACD Loans tests", accounts => {
    before(async function() {
        tokenUcd = await TokenUcd.deployed();
        rates = await Rates.deployed();
        loanManager = await LoanManager.deployed();
        reserveAcc = tokenUcd.address;
        testedAccounts = [reserveAcc, acc1];

        products = {
            defaulting: await loanTestHelper.getProductInfo(loanManager, 6),
            repaying: await loanTestHelper.getProductInfo(loanManager, 5),
            notDue: await loanTestHelper.getProductInfo(loanManager, 4)
        };
    });

    beforeEach(async function() {
        balBefore = await tokenUcdTestHelper.getBalances(
            tokenUcd,
            testedAccounts
        );
        totalSupplyBefore = await tokenUcd.totalSupply();
    });

    it("Should NOT get a loan less than minLoanAmount");

    it("Should get an ACD loan", async function() {
        let expLoan = await loanTestHelper.calcLoanValues(
            rates,
            products.repaying,
            collateralWei
        );
        expLoan.state = 0;
        expLoan.borrower = acc1;
        expLoan.collateral = collateralWei;

        let tx = await loanManager.newEthBackedLoan(products.repaying.id, {
            from: acc1,
            value: collateralWei
        });
        testHelper.logGasUse(this, tx, "newEthBackedLoan");

        let loanContract = loanTestHelper.newLoanEventAsserts(tx, expLoan);

        await loanTestHelper.loanContractAsserts(loanContract, expLoan);

        assert.equal(
            (await tokenUcd.totalSupply()).toString(),
            totalSupplyBefore.plus(expLoan.loanAmount).toString(),
            "total ACD supply should be increased by the loan amount"
        );

        let expBalances = [
            {
                name: "reserve",
                address: reserveAcc,
                ucd: balBefore[0].ucd
                    .plus(expLoan.loanAmount)
                    .minus(expLoan.disbursedAmount),
                eth: balBefore[0].eth
            },
            {
                name: "acc1",
                address: acc1,
                ucd: balBefore[1].ucd.plus(expLoan.disbursedAmount),
                eth: balBefore[1].eth.minus(collateralWei),
                gasFee: NEWLOAN_MAXFEE
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("Should NOT collect a loan before it's due");
    it("Should NOT collect a loan before paymentperiod is over");
    it(
        "Should NOT repay an ACD loan on maturity if ACD balance is insufficient"
    );
    it("Only owner should repay a loan when it's due");

    it("Should repay an ACD loan on maturity", async function() {
        let expLoan = await loanTestHelper.calcLoanValues(
            rates,
            products.repaying,
            collateralWei
        );
        expLoan.state = 1; // repaid
        expLoan.borrower = acc1;
        expLoan.collateral = collateralWei;
        let tx = await loanManager.newEthBackedLoan(products.repaying.id, {
            from: acc1,
            value: collateralWei
        });
        testHelper.logGasUse(this, tx, "newEthBackedLoan");

        let loanContract = loanTestHelper.newLoanEventAsserts(tx, expLoan);
        let loanId = await loanContract.loanId();

        let interestAmount = expLoan.loanAmount.minus(expLoan.disbursedAmount);

        await tokenUcd.getFromReserve(interestAmount, { from: acc0 });
        await tokenUcd.transferWithNarrative(
            acc1,
            interestAmount,
            "send interest to borrower to have enough ACD to repay in test",
            {
                from: acc0
            }
        );
        await testHelper.waitForTimeStamp(
            expLoan.product.term.add(expLoan.disbursementTime).toNumber()
        );

        tx = await loanManager
            .repay(loanId, { from: acc1 })
            .catch(error => console.log(error));
        testHelper.logGasUse(this, tx, "repay");
        await loanTestHelper.loanContractAsserts(loanContract, expLoan);

        assert.equal(
            (await tokenUcd.totalSupply()).toString(),
            totalSupplyBefore.toString(),
            "total ACD supply should be the same"
        );
        );

        let expBalances = [
            {
                name: "reserve",
                address: reserveAcc,
                ucd: balBefore[0].ucd,
                eth: balBefore[0].eth
            },
            {
                name: "acc1",
                address: acc1,
                ucd: balBefore[1].ucd, // it's the same b/c we sent the exact loanAmount after we saved the bal
                eth: balBefore[1].eth, // it's the same b/c we get loan after we saved the bal
                gasFee: REPAY_MAXFEE
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("Should NOT repay a loan after paymentperiod is over");

    it("Should collect a defaulted ACD loan");

    it("Should NOT collect an already collected ACD loan");

    it("Should collect multiple defaulted ACD loans ");

    it("Should get and repay a loan with colletaralRatio = 1");
    it("Should get and repay a loan with colletaralRatio > 1");
    it("Should get and collect a loan with colletaralRatio = 1");
    it("Should get and collect a loan with colletaralRatio > 1");
});
