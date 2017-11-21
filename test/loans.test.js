const loanTestHelper = new require("./helpers/loanTestHelper.js");
const tokenUcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");
const Rates = artifacts.require("./Rates.sol");
const LoanManager = artifacts.require("./loanManager.sol");
const TokenUcd = artifacts.require("./TokenAcd.sol");
const NEWLOAN_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const REPAY_MAXFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)
const COLLECT_BASEFEE = web3.toWei(0.11); // TODO: set this to expected value (+set gasPrice)

const acc0 = web3.eth.accounts[0],
    acc1 = web3.eth.accounts[1],
    acc2 = web3.eth.accounts[2];

const collateralWei = web3.toWei(0.5);
let tokenUcd, loanManager, rates, products;
let balBefore, totalSupplyBefore;

contract("ACD Loans tests", accounts => {
    before(async function() {
        tokenUcd = await TokenUcd.deployed();
        await tokenUcd.issue(1000000000);
        await tokenUcd.withdrawTokens(accounts[0], 1000000000);
        rates = await Rates.deployed();
        loanManager = await LoanManager.deployed();
        reserveAcc = tokenUcd.address;
        interestPoolAcc = await tokenUcd.interestPoolAccount();
        interestEarnedAcc = await tokenUcd.interestEarnedAccount();
        testedAccounts = [
            reserveAcc,
            acc1,
            acc2,
            interestPoolAcc,
            interestEarnedAcc
        ];

        products = {
            defaulting: await loanTestHelper.getProductInfo(loanManager, 6),
            repaying: await loanTestHelper.getProductInfo(loanManager, 5),
            notDue: await loanTestHelper.getProductInfo(loanManager, 4)
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
        let loanContract = loanTestHelper.newLoanEventAsserts(tx, expLoan);
        await loanTestHelper.loanContractAsserts(loanContract, expLoan);
        testHelper.logGasUse(this, tx, "newEthBackedLoan");

        assert.equal(
            (await tokenUcd.totalSupply()).toString(),
            totalSupplyBefore.add(expLoan.loanAmount).toString(),
            "total ACD supply should be increased by the loan amount"
        );

        assert.equal(
            (await web3.eth.getBalance(loanContract.address)).toString(),
            collateralWei.toString(),
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
                name: "acc1",
                address: acc1,
                ucd: balBefore[1].ucd.add(expLoan.disbursedAmount),
                eth: balBefore[1].eth.minus(collateralWei),
                gasFee: NEWLOAN_MAXFEE
            },
            {
                name: "interestPool Acc",
                address: interestPoolAcc,
                ucd: balBefore[3].ucd.add(expLoan.interestAmount),
                eth: balBefore[3].eth
            },
            {
                name: "interestEarned Acc",
                address: interestEarnedAcc,
                ucd: balBefore[4].ucd,
                eth: balBefore[4].eth
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
    it("Should not repay with invalid loanId");

    it("Should repay an ACD loan after maturity", async function() {
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
        let loanContract = loanTestHelper.newLoanEventAsserts(tx, expLoan);
        let loanId = await loanContract.loanId();
        testHelper.logGasUse(this, tx, "newEthBackedLoan");

        // send interest to borrower to have enough ACD to repay in test
        await tokenUcd.transfer(expLoan.borrower, expLoan.interestAmount, {
            from: acc0
        });

        await testHelper.waitForTimeStamp(
            expLoan.product.term.add(expLoan.disbursementTime).toNumber()
        );

        tx = await loanManager
            .repay(loanId, { from: acc1 })
            .catch(error => console.log(error));
        await loanTestHelper.loanContractAsserts(loanContract, expLoan);
        testHelper.logGasUse(this, tx, "repay");

        assert.equal(
            (await tokenUcd.totalSupply()).toString(),
            totalSupplyBefore.toString(),
            "total ACD supply should be the same"
        );

        assert.equal(
            (await web3.eth.getBalance(loanContract.address)).toString(),
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
                name: "acc1",
                address: acc1,
                ucd: balBefore[1].ucd, // it's the same b/c we sent the exact loanAmount after we saved the bal
                eth: balBefore[1].eth, // it's the same b/c we get loan after we saved the bal
                gasFee: REPAY_MAXFEE
            },
            {
                name: "interestPool Acc",
                address: interestPoolAcc,
                ucd: balBefore[3].ucd,
                eth: balBefore[3].eth
            },
            {
                name: "interestEarned Acc",
                address: interestEarnedAcc,
                ucd: balBefore[4].ucd.add(expLoan.interestAmount),
                eth: balBefore[4].eth
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("Should repay an ACD loan BEFORE maturity");

    it("Should collect a defaulted ACD loan", async function() {
        let expLoan = await loanTestHelper.calcLoanValues(
            rates,
            products.defaulting,
            collateralWei
        );
        expLoan.state = 1; // open first
        expLoan.borrower = acc1;
        expLoan.collateral = collateralWei;
        let tx = await loanManager.newEthBackedLoan(products.defaulting.id, {
            from: acc1,
            value: collateralWei
        });

        let loanContract = loanTestHelper.newLoanEventAsserts(tx, expLoan);
        let loanId = await loanContract.loanId();
        testHelper.logGasUse(this, tx, "newEthBackedLoan");

        await testHelper.waitForTimeStamp(
            (await loanContract.maturity())
                .add(expLoan.product.repayPeriod)
                .toNumber()
        );

        expLoan.state = 2; // defaulted
        tx = await loanManager
            .collect([loanId], { from: acc2 })
            .catch(error => console.log(error));

        await loanTestHelper.loanContractAsserts(loanContract, expLoan);
        testHelper.logGasUse(this, tx, "collect 1");

        assert.equal(
            (await tokenUcd.totalSupply()).toString(),
            totalSupplyBefore.add(expLoan.loanAmount).toString(),
            "total ACD supply should be increased by the defaulted loanAmount"
        );

        assert.equal(
            (await web3.eth.getBalance(loanContract.address)).toString(),
            "0",
            "collateral ETH in loanContract should be 0"
        );

        let expBalances = [
            {
                name: "reserve",
                address: reserveAcc,
                ucd: balBefore[0].ucd.add(expLoan.interestAmount),
                eth: balBefore[0].eth.add(collateralWei)
            },
            {
                name: "acc1",
                address: acc1,
                ucd: balBefore[1].ucd.add(expLoan.disbursedAmount),
                eth: balBefore[1].eth.minus(collateralWei),
                gasFee: NEWLOAN_MAXFEE
            },
            {
                name: "acc2", // collect tx calling acc
                address: acc2,
                ucd: balBefore[2].ucd,
                eth: balBefore[2].eth,
                gasFee: COLLECT_BASEFEE
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("Should NOT repay a loan after paymentperiod is over");

    it("Should NOT collect an already collected ACD loan");

    it("Should collect multiple defaulted ACD loans ");

    it("Should get and repay a loan with colletaralRatio = 1");
    it("Should get and repay a loan with colletaralRatio > 1");
    it("Should get and collect a loan with colletaralRatio = 1");
    it("Should get and collect a loan with colletaralRatio > 1");
});
