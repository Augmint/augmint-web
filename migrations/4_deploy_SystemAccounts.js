var FeeAccount = artifacts.require("./FeeAccount.sol");
var InterestPoolAccount = artifacts.require("./InterestPoolAccount.sol");
var InterestEarnedAccount = artifacts.require("./InterestEarnedAccount.sol");

module.exports = function(deployer) {
    deployer.deploy(FeeAccount);
    deployer.deploy(InterestPoolAccount);
    deployer.deploy(InterestEarnedAccount);
};
