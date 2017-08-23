var SafeMath = artifacts.require("./SafeMath.sol");
var TokenUcd = artifacts.require("./TokenUcd.sol");
var Rates = artifacts.require("./Rates.sol");

module.exports = function(deployer) {
    deployer.link(SafeMath, TokenUcd);
    deployer.deploy(TokenUcd);
};
