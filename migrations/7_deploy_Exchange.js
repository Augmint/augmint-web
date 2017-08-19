var TokenUcd = artifacts.require("./TokenUcd.sol");
var Rates = artifacts.require("./Rates.sol");
//var SafeMath = artifacts.require("./SafeMath.sol");
var OrdersLib = artifacts.require("./OrdersLib.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer, network) {
    //deployer.link(SafeMath, Exchange);
    deployer.link(OrdersLib, Exchange);
    deployer.deploy(Exchange, TokenUcd.address, Rates.address).then(res => {
        TokenUcd.deployed().then(res => {
            res.setExchangeAddress(Exchange.address);
        });
    });
};
