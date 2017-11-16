const testHelper = new require("./helpers/testHelper.js");
const LoanManager = artifacts.require("./loanManager.sol");
//const TRANSFER_MAXFEE = web3.toWei(0.006); // TODO: set this to expected value (+set gasPrice)

const acc0 = web3.eth.accounts[0],
    acc1 = web3.eth.accounts[1];
const collateralWei = web3.toWei(0.5);
let loanManager;

contract("loanManager  tests", accounts => {
    before(async function() {
        loanManager = await LoanManager.deployed();
    });

    beforeEach(async function() {
        //balBefore = await tokenUcdTestHelper.getBalances(tokenUcd, testedAccounts);
    });

    it("Should add new product");
    it("Only owner should add new product");

    it("Should disable product");
    it("Only owner should disable product");

    it("Should enable product");
    it("Only owner should enable product");
});
