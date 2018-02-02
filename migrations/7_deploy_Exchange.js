const TokenAce = artifacts.require("./TokenAce.sol");
const Rates = artifacts.require("./Rates.sol");
const SafeMath = artifacts.require("./SafeMath.sol");
const Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer, network, accounts) {
    deployer.link(SafeMath, Exchange);
    deployer.deploy(Exchange, TokenAce.address, Rates.address, 1000000);
    deployer.then(async () => {
        const exchange = Exchange.at(Exchange.address);
        await exchange.grantMultiplePermissions(accounts[0], ["MonetaryBoard"]);

        const tokenAce = TokenAce.at(TokenAce.address);
        await tokenAce.grantMultiplePermissions(Exchange.address, ["ExchangeContracts", "NoFeeTransferContracts"]);
    });
};
