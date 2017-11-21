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
        2000 /* transferFeePt in parts per million = 0.2% */,
        200 /* min: 0.02 ACD */,
        50000 /* max fee: 5 ACD */
    );
};
