const TokenAce = artifacts.require("./TokenAce.sol");
const Rates = artifacts.require("./Rates.sol");
const SafeMath = artifacts.require("./SafeMath.sol");
const OrdersLib = artifacts.require("./OrdersLib.sol");
const Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer, network) {
    deployer.link(SafeMath, Exchange);
    deployer.link(OrdersLib, Exchange);
    deployer.deploy(Exchange, TokenAce.address, Rates.address);
    deployer.then(async () => {
        const tokenAce = TokenAce.at(TokenAce.address);
        await tokenAce.grantPermission(Exchange.address, "transferNoFee");
    });
};
