const TokenAce = artifacts.require("./TokenAce.sol");
const Rates = artifacts.require("./Rates.sol");
const SafeMath = artifacts.require("./SafeMath.sol");
const Exchange = artifacts.require("./Exchange.sol");

module.exports = function(deployer, network) {
    deployer.link(SafeMath, Exchange);
    deployer.deploy(Exchange, TokenAce.address, Rates.address, 100);
    deployer.then(async () => {
        const tokenAce = TokenAce.at(TokenAce.address);
        await tokenAce.grantMultiplePermissions(Exchange.address, ["Exchange", "transferNoFee", "transferFromNoFee"]);
    });
};
