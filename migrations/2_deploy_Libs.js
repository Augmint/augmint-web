var SafeMath = artifacts.require("./SafeMath.sol");
var OrdersLib = artifacts.require("./OrdersLib.sol");

module.exports = function(deployer) {
    deployer.deploy(SafeMath);
    deployer.deploy(OrdersLib);
};
