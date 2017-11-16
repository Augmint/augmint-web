const tokenUcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");
const TRANSFER_MAXFEE = web3.toWei(0.006); // TODO: set this to expected value (+set gasPrice)

const acc0 = web3.eth.accounts[0],
    acc1 = web3.eth.accounts[1],
    acc2 = web3.eth.accounts[2];
const txValue = 200000000,
    txNarrative = "ACD transfer test";
let tokenUcd;

before(async function() {
    tokenUcd = await tokenUcdTestHelper.getTokenUcd(1000000000);
    testedAccounts = [acc0, acc1, acc2];
});

beforeEach(async function() {
    balBefore = await tokenUcdTestHelper.getBalances(tokenUcd, testedAccounts);
});

contract("Transfer ACD tests", accounts => {
    it("Should be able to transfer ACD between accounts (without narrative)", async function() {
        let tx = await tokenUcd.transfer(acc1, txValue, { from: acc0 });
        testHelper.logGasUse(this, tx);
        assert.equal(
            tx.logs[0].event,
            "e_transfer",
            "e_transfer event should be emited"
        );
        assert.equal(
            tx.logs[0].args.from,
            acc0,
            "from: in e_transfer event should be set"
        );
        assert.equal(
            tx.logs[0].args.to,
            acc1,
            "to: in e_transfer event should be set"
        );
        assert.equal(
            tx.logs[0].args.narrative,
            "",
            "narrative in e_transfer event should be set"
        );
        assert.equal(
            tx.logs[0].args.amount.toString(),
            txValue.toString(),
            "amount in e_transfer event should be set"
        );
        let expBalances = [
            {
                name: "acc0",
                address: acc0,
                ucd: balBefore[0].ucd.minus(txValue),
                eth: balBefore[0].eth,
                gasFee: TRANSFER_MAXFEE
            },
            {
                name: "acc1",
                address: acc1,
                ucd: balBefore[1].ucd.plus(txValue),
                eth: balBefore[1].eth
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("Should be able to transfer ACD between accounts (with narrative)", async function() {
        let tx = await tokenUcd.transferWithNarrative(
            acc1,
            txValue,
            txNarrative,
            { from: acc0 }
        );
        testHelper.logGasUse(this, tx);
        assert.equal(
            tx.logs[0].event,
            "e_transfer",
            "e_transfer event should be emited"
        );
        assert.equal(
            tx.logs[0].args.from,
            acc0,
            "from: in e_transfer event should be set"
        );
        assert.equal(
            tx.logs[0].args.to,
            acc1,
            "to: in e_transfer event should be set"
        );
        assert.equal(
            tx.logs[0].args.narrative,
            txNarrative,
            "narrative in e_transfer event should be set"
        );
        assert.equal(
            tx.logs[0].args.amount.toString(),
            txValue.toString(),
            "amount in e_transfer event should be set"
        );
        let expBalances = [
            {
                name: "acc0",
                address: acc0,
                ucd: balBefore[0].ucd.minus(txValue),
                eth: balBefore[0].eth,
                gasFee: TRANSFER_MAXFEE
            },
            {
                name: "acc1",
                address: acc1,
                ucd: balBefore[1].ucd.plus(txValue),
                eth: balBefore[1].eth
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });
    it("Shouldn't be able to transfer ACD when ACD balance is insufficient", async function() {
        // it throws until TokenUcd refactor (i.e. tokenUcd should  require instead of returning false)
        return testHelper.expectThrow(
            tokenUcd.transfer(acc2, balBefore[1].ucd.plus(1), { from: acc1 })
        );
    });

    it("Shouldn't be able to transfer 0 ACD", async function() {
        // it throws until TokenUcd refactor (i.e. tokenUcd should  require instead of returning false)
        return testHelper.expectThrow(
            tokenUcd.transfer(acc1, 0, { from: acc0 })
        );
    });

    it("Shouldn't be able to transfer ACD between the same accounts", async function() {
        return testHelper.expectThrow(
            tokenUcd.transfer(acc0, txValue, { from: acc0 })
        );
    });
});
