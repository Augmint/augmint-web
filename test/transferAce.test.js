const tokenAceTestHelper = new require("./helpers/tokenAceTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");

let tokenAce, minFee, maxFee, feePt, minFeeAmount, maxFeeAmount;

contract("Transfer ACE tests", accounts => {
    before(async function() {
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        await tokenAce.issue(1000000000);
        await Promise.all([
            await tokenAce.withdrawTokens(accounts[0], 1000000000),
            (minFee = await tokenAce.transferFeeMin()),
            (maxFee = await tokenAce.transferFeeMax()),
            (feePt = await tokenAce.transferFeePt())
        ]);
        minFeeAmount = minFee.div(feePt).mul(1000000);
        maxFeeAmount = maxFee.div(feePt).mul(1000000);
    });

    it("Should be able to transfer ACE between accounts (without narrative, min fee)", async function() {
        await tokenAceTestHelper.transferTest(this, {
            from: accounts[0],
            to: accounts[1],
            amount: minFeeAmount.sub(10),
            narrative: ""
        });
    });

    it("Should be able to transfer ACE between accounts (with narrative, max fee)", async function() {
        await tokenAceTestHelper.transferTest(this, {
            from: accounts[0],
            to: accounts[1],
            amount: maxFeeAmount.add(10),
            narrative: "test narrative"
        });
    });

    it("transfer fee % should deducted when fee % is between min and max fee", async function() {
        await tokenAceTestHelper.transferTest(this, {
            from: accounts[0],
            to: accounts[1],
            amount: maxFeeAmount.sub(10),
            narrative: ""
        });
    });

    it("Shouldn't be able to transfer ACE when ACE balance is insufficient", async function() {
        return testHelper.expectThrow(
            tokenAce.transfer(accounts[2], (await tokenAce.balanceOf(accounts[1])).plus(1), {
                from: accounts[1]
            })
        );
    });

    it("Shouldn't be able to transfer 0 ACE", async function() {
        return testHelper.expectThrow(tokenAce.transfer(accounts[1], 0, { from: accounts[0] }));
    });

    it("Shouldn't be able to transfer ACE between the same accounts", async function() {
        return testHelper.expectThrow(
            tokenAce.transfer(accounts[0], 20000, {
                from: accounts[0]
            })
        );
    });

    it("transferNoFee", async function() {
        await tokenAceTestHelper.transferTest(this, {
            from: accounts[0],
            to: accounts[1],
            amount: 10000,
            narrative: "transferNofee test",
            fee: 0
        });
    });

    it("transferNoFee only from allowed account", async function() {
        let amount = 10000;
        await tokenAce.transfer(accounts[1], amount + maxFee.toNumber(), { from: accounts[0] });
        return testHelper.expectThrow(
            tokenAceTestHelper.transferTest(this, {
                from: accounts[1],
                to: accounts[2],
                amount: amount,
                narrative: "transferNofee test",
                fee: 0
            })
        );
    });
});
