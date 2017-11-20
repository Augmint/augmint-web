var SafeMath = artifacts.require("./SafeMath.sol");
var TokenAcd = artifacts.require("./TokenAcd.sol");
var FeeAccount = artifacts.require("./FeeAccount.sol");
var InterestPoolAccount = artifacts.require("./InterestPoolAccount.sol");
var InterestEarnedAccount = artifacts.require("./InterestEarnedAccount.sol");

module.exports = function(deployer) {
    deployer.link(SafeMath, TokenAcd);
    deployer.deploy(
        TokenAcd,
        FeeAccount.address,
        InterestPoolAccount.address,
        InterestEarnedAccount.address,
        500 /* transferFeeDiv =  1/500 = 0.2% */,
        2000 /* min: 0.02 ACD */,
        50000 /* max fee: 5 ACD */
    );
};
