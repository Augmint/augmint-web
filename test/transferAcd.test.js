const TokenUcd = artifacts.require("./TokenAcd.sol");
const tokenUcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const testHelper = new require("./helpers/testHelper.js");

let tokenUcd;

contract("Transfer ACD tests", accounts => {
    before(async function() {
        tokenUcd = await TokenUcd.deployed();
        await tokenUcd.issue(1000000000);
        await tokenUcd.withdrawTokens(accounts[0], 1000000000);
    });

    it("Should be able to transfer ACD between accounts (without narrative)", async function() {
        await tokenUcdTestHelper.transferTest(
            { test: this, name: "transfer no narr" },
            accounts[0],
            accounts[1],
            200000000,
            ""
        );
    });

    it("Should be able to transfer ACD between accounts (with narrative)", async function() {
        await tokenUcdTestHelper.transferTest(
            { test: this, name: "transfer w/ narr" },
            accounts[0],
            accounts[1],
            200000000,
            "test narrative"
        );
    });

    it("transfer fee % should deducted when fee % is between min and max fee");
    it("min transfer fee should deducted when fee % is less than min fee");
    it("max transfer fee should deducted when fee % is more than max fee");

    it("Shouldn't be able to transfer ACD when ACD balance is insufficient", async function() {
        // it throws until TokenUcd refactor (i.e. tokenUcd should  require instead of returning false)
        return testHelper.expectThrow(
            tokenUcd.transfer(
                accounts[2],
                (await tokenUcd.balanceOf(accounts[1])).plus(1),
                {
                    from: accounts[1]
                }
            )
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
