var Rates = artifacts.require("./Rates.sol");

module.exports = function(deployer) {
  deployer.deploy(Rates);
};
