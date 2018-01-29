var Rates = artifacts.require("./Rates.sol");
var SafeMath = artifacts.require("./SafeMath.sol");

module.exports = async function(deployer, network, accounts) {
    deployer.link(SafeMath, Rates);
    await deployer.deploy(Rates);
    const rates = Rates.at(Rates.address);
    await rates.grantPermission(accounts[0], "setRate");
    await rates.setRate("EUR", 9980000);
};
