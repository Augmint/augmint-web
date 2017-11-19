const TokenUcd = artifacts.require("./TokenAcd.sol");
const tokenUcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");
const TRANSFER_MAXFEE = web3.toWei(0.006); // TODO: set this to expected value (+set gasPrice)

let tokenUcd;

contract("Transfer ACD tests", accounts => {
    before(async function() {
        tokenUcd = await TokenUcd.deployed();
        await tokenUcd.issue(1000000000);
        await tokenUcd.getFromReserve(1000000000);
        testedAccounts = [accounts[0], accounts[1], accounts[2]];
    });

    beforeEach(async function() {
        balBefore = await tokenUcdTestHelper.getBalances(
            tokenUcd,
            testedAccounts
        );
    });

    it("Should be able to transfer ACD between accounts (without narrative)", async function() {
        expTransfer = {
            from: accounts[0],
            to: accounts[1],
            amount: 200000000,
            narrative: ""
        };
        let tx = await tokenUcd.transfer(expTransfer.to, expTransfer.amount, {
            from: expTransfer.from
        });
        testHelper.logGasUse(this, tx);

        tokenUcdTestHelper.transferEventAsserts(tx, expTransfer);
        let expBalances = [
            {
                name: "acc from",
                address: expTransfer.from,
                ucd: balBefore[0].ucd.minus(expTransfer.amount),
                eth: balBefore[0].eth,
                gasFee: TRANSFER_MAXFEE
            },
            {
                name: "acc to",
                address: expTransfer.to,
                ucd: balBefore[1].ucd.plus(expTransfer.amount),
                eth: balBefore[1].eth
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("Should be able to transfer ACD between accounts (with narrative)", async function() {
        expTransfer = {
            from: accounts[0],
            to: accounts[1],
            amount: 200000000,
            narrative: "test narrative"
        };
        let tx = await tokenUcd.transferWithNarrative(
            expTransfer.to,
            expTransfer.amount,
            expTransfer.narrative,
            { from: expTransfer.from }
        );
        testHelper.logGasUse(this, tx);
        tokenUcdTestHelper.transferEventAsserts(tx, expTransfer);
        let expBalances = [
            {
                name: "acc from",
                address: expTransfer.from,
                ucd: balBefore[0].ucd.minus(expTransfer.amount),
                eth: balBefore[0].eth,
                gasFee: TRANSFER_MAXFEE
            },
            {
                name: "acc to",
                address: expTransfer.to,
                ucd: balBefore[1].ucd.plus(expTransfer.amount),
                eth: balBefore[1].eth
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("transfer fee % should deducted when fee % is between min and max fee");
    it("min transfer fee should deducted when fee % is less than min fee");
    it("max transfer fee should deducted when fee % is more than max fee");

    it("Shouldn't be able to transfer ACD when ACD balance is insufficient", async function() {
        // it throws until TokenUcd refactor (i.e. tokenUcd should  require instead of returning false)
        return testHelper.expectThrow(
            tokenUcd.transfer(accounts[2], balBefore[1].ucd.plus(1), {
                from: accounts[1]
            })
        );
    });

    it("Shouldn't be able to transfer 0 ACD", async function() {
        // it throws until TokenUcd refactor (i.e. tokenUcd should  require instead of returning false)
        return testHelper.expectThrow(
            tokenUcd.transfer(accounts[1], 0, { from: accounts[0] })
        );
    });

    it("Shouldn't be able to transfer ACD between the same accounts", async function() {
        return testHelper.expectThrow(
            tokenUcd.transfer(accounts[0], 20000, {
                from: accounts[0]
            })
        );
    });

    it("transferFrom");
    it("transferFromWithNarrative");
    it("transferFrom w/o approve attempt");
});
