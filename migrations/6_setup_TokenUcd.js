var TokenUcd = artifacts.require("./TokenUcd.sol");
var LoanManager = artifacts.require("./LoanManager.sol");

module.exports = function(deployer, network) {
    TokenUcd.deployed().then(tokenUcd => {
        tokenUcd.setLoanManagerAddress(LoanManager.address);
    });
};
