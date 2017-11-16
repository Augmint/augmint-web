var TokenUcd = artifacts.require("./TokenUcd.sol");
var Rates = artifacts.require("./Rates.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var OrdersLib = artifacts.require("./OrdersLib.sol");
var Exchange = artifacts.require("./Exchange.sol");

module.exports = async function(deployer, network) {
    try {
        deployer.link(SafeMath, Exchange);
        deployer.link(OrdersLib, Exchange);
        await deployer.deploy(Exchange, TokenUcd.address, Rates.address);
        tokenUcd = await TokenUcd.deployed();
        return await tokenUcd.setExchangeAddress(Exchange.address);
    } catch (error) {
        console.log("error in deploy_Exchange", error);
        return Promise.reject(error);
    }
};
