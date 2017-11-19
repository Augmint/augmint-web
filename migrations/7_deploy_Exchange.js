var TokenAcd = artifacts.require("./TokenAcd.sol");
var Rates = artifacts.require("./Rates.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var OrdersLib = artifacts.require("./OrdersLib.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer, network) {
    deployer.link(SafeMath, Exchange);
    deployer.link(OrdersLib, Exchange);
    deployer.deploy(Exchange, TokenAcd.address, Rates.address);
    deployer.then(async () => {
        tokenAcd = await TokenAcd.deployed();
        await tokenAcd.setExchangeAddress(Exchange.address);
    });
};
