var TokenUcd = artifacts.require("./TokenUcd.sol");
var Rates = artifacts.require("./Rates.sol");

module.exports = function(deployer) {
    deployer.deploy(TokenUcd);
};
