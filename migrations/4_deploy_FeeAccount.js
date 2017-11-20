var FeeAccount = artifacts.require("./FeeAccount.sol");

module.exports = function(deployer) {
    deployer.deploy(FeeAccount);
};
