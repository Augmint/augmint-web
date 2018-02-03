const TokenAEur = artifacts.require("./TokenAEur.sol");
const Rates = artifacts.require("./Rates.sol");
const SafeMath = artifacts.require("./SafeMath.sol");
const Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer, network, accounts) {
    deployer.link(SafeMath, Exchange);
    deployer.deploy(Exchange, TokenAEur.address, Rates.address, 1000000);
    deployer.then(async () => {
        const exchange = Exchange.at(Exchange.address);
        await exchange.grantMultiplePermissions(accounts[0], ["MonetaryBoard"]);

        const tokenAEur = TokenAEur.at(TokenAEur.address);
        await tokenAEur.grantMultiplePermissions(Exchange.address, ["ExchangeContracts", "NoFeeTransferContracts"]);
    });
};
