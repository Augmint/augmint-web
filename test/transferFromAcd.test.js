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

        await tokenAcdTestHelper.approveTest(this, expApprove);

        await tokenAcdTestHelper.transferFromTest(this, {
            from: expApprove.owner,
            to: expApprove.spender,
            amount: Math.round(expApprove.value / 2)
        });

        await tokenAcdTestHelper.transferFromTest(this, {
            from: expApprove.owner,
            to: expApprove.spender,
            amount: Math.round(expApprove.value / 2),
            narrative: "Test with narrative"
        });
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

        await tokenAcdTestHelper.approveTest(this, expApprove);
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
        await tokenAcdTestHelper.approveTest(this, expApprove);

        await testHelper.expectThrow(
            tokenAcd.transferFrom(expApprove.owner, expApprove.spender, expApprove.value + 1, {
                from: expApprove.spender
            })
        );
    });

    it("transferFromNoFee", async function() {
        let expApprove = {
            owner: accounts[1],
            spender: accounts[0],
            value: 100000
        };
        await tokenAcdTestHelper.approveTest(this, expApprove);
        let amount = 100000;
        await tokenAcd.transfer(expApprove.owner, amount, { from: accounts[0] });
        await tokenAcdTestHelper.transferFromTest(this, {
            from: expApprove.owner,
            to: expApprove.spender,
            amount: expApprove.value,
            fee: 0
        });
    });

    it("transferFromNoFee only by allowed", async function() {
        let expApprove = {
            owner: accounts[0],
            spender: accounts[1],
            value: 100000
        };
        await tokenAcdTestHelper.approveTest(this, expApprove);
        let amount = maxFee.toNumber(); // to cover costs
        await tokenAcd.transfer(expApprove.spender, amount, { from: accounts[0] });
        await testHelper.expectThrow(
            tokenAcdTestHelper.transferFromTest(this, {
                from: expApprove.owner,
                to: expApprove.spender,
                amount: expApprove.value,
                fee: 0
            })
        );
    });
});
