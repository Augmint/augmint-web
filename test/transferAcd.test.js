const tokenAcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");

let tokenAcd, minFee, maxFee, feePt, minFeeAmount, maxFeeAmount;

contract("Transfer ACD tests", accounts => {
    before(async function() {
        tokenAcd = await tokenAcdTestHelper.newTokenAcdMock();
        await tokenAcd.issue(1000000000);
        await Promise.all([
            await tokenAcd.withdrawTokens(accounts[0], 1000000000),
            (minFee = await tokenAcd.transferFeeMin()),
            (maxFee = await tokenAcd.transferFeeMax()),
            (feePt = await tokenAcd.transferFeePt())
        ]);
        minFeeAmount = minFee.div(feePt).mul(1000000);
        maxFeeAmount = maxFee.div(feePt).mul(1000000);
    });

    it("Should be able to transfer ACD between accounts (without narrative, min fee)", async function() {
        await tokenAcdTestHelper.transferTest(
            { test: this, name: "transfer no narr" },
            {
                from: accounts[0],
                to: accounts[1],
                amount: minFeeAmount.sub(10),
                narrative: ""
            }
        );
    });

    it("Should be able to transfer ACD between accounts (with narrative, max fee)", async function() {
        await tokenAcdTestHelper.transferTest(
            { test: this, name: "transfer w/ narr" },
            {
                from: accounts[0],
                to: accounts[1],
                amount: maxFeeAmount.add(10),
                narrative: "test narrative"
            }
        );
    });

    it("transfer fee % should deducted when fee % is between min and max fee", async function() {
        await tokenAcdTestHelper.transferTest(
            { test: this, name: "transfer b/w min and max fee" },
            {
                from: accounts[0],
                to: accounts[1],
                amount: maxFeeAmount.sub(10),
                narrative: ""
            }
        );
    });

    it("Shouldn't be able to transfer ACD when ACD balance is insufficient", async function() {
        return testHelper.expectThrow(
            tokenAcd.transfer(accounts[2], (await tokenAcd.balanceOf(accounts[1])).plus(1), {
                from: accounts[1]
            })
        );
    });

    it("Shouldn't be able to transfer 0 ACD", async function() {
        return testHelper.expectThrow(tokenAcd.transfer(accounts[1], 0, { from: accounts[0] }));
    });

    it("Shouldn't be able to transfer ACD between the same accounts", async function() {
        return testHelper.expectThrow(
            tokenAcd.transfer(accounts[0], 20000, {
                from: accounts[0]
            })
        );
    });

    it("transferNoFee only by allowed");

    it("transferNoFee");
});
