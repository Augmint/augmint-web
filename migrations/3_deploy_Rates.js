var Rates = artifacts.require("./Rates.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer) {
    deployer.link(SafeMath, Rates);
    deployer.deploy(Rates);
};
