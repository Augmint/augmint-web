const tokenAcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");
let tokenAcd, maxFee;

contract("TransferFrom ACD tests", accounts => {
    before(async function() {
        tokenAcd = await tokenAcdTestHelper.newTokenAcdMock();
        await tokenAcd.issue(1000000000);
        await tokenAcd.withdrawTokens(accounts[0], 1000000000);
        maxFee = await tokenAcd.transferFeeMax();
    });

    it("transferFrom", async function() {
        let expApprove = {
            owner: accounts[0],
            spender: accounts[1],
            value: 100000
        };

        await tokenAcdTestHelper.approveTest({ test: this, name: "transferFrom no narr" }, expApprove);

        await tokenAcdTestHelper.transferFromTest(
            { test: this, name: "transferFrom no narr" },
            {
                from: expApprove.owner,
                to: expApprove.spender,
                amount: Math.round(expApprove.value / 2)
            }
        );

        await tokenAcdTestHelper.transferFromTest(
            { test: this, name: "transferFrom with narr" },
            {
                from: expApprove.owner,
                to: expApprove.spender,
                amount: Math.round(expApprove.value / 2),
                narrative: "Test with narrative"
            }
        );
    });

    it("transferFrom only if approved", async function() {
        return testHelper.expectThrow(
            tokenAcd.transferFrom(accounts[0], accounts[2], 100, {
                from: accounts[2]
            })
        );
    });

    it("transferFrom only if approved is greater than amount", async function() {
        let expApprove = {
            owner: accounts[0],
            spender: accounts[1],
            value: 200000
        };

        await tokenAcdTestHelper.approveTest({ test: this, name: "transferFrom only if approved greater" }, expApprove);
        return testHelper.expectThrow(
            tokenAcd.transferFrom(expApprove.owner, expApprove.spender, expApprove.value + 1, {
                from: expApprove.spender
            })
        );
    });

    it("transferFrom only if balance is enough", async function() {
        await tokenAcd.transfer(accounts[1], maxFee, { from: accounts[0] }); // to cover the transfer fee
        let amount = await tokenAcd.balanceOf(accounts[0]);
        let expApprove = {
            owner: accounts[0],
            spender: accounts[1],
            value: amount
        };
        await tokenAcdTestHelper.approveTest(
            { test: this, name: "transferFrom only if balance is enough" },
            expApprove
        );

        await testHelper.expectThrow(
            tokenAcd.transferFrom(expApprove.owner, expApprove.spender, expApprove.value + 1, {
                from: expApprove.spender
            })
        );
    });

    it("transferFromNoFee");

    it("transferFromNoFee only by allowed");
});
