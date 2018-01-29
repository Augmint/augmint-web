var FeeAccount = artifacts.require("./FeeAccount.sol");
const InterestEarnedAccount = artifacts.require("./InterestEarnedAccount.sol");

module.exports = function(deployer) {
    deployer.deploy(FeeAccount);
    deployer.deploy(InterestEarnedAccount);
};
