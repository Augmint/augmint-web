var SafeMath = artifacts.require("./SafeMath.sol");
var TokenAcd = artifacts.require("./TokenAcd.sol");
var Rates = artifacts.require("./Rates.sol");

module.exports = function(deployer) {
    deployer.link(SafeMath, TokenAcd);
    deployer.deploy(TokenAcd);
};
