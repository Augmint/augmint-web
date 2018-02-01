const SafeMath = artifacts.require("./SafeMath.sol");
const TokenAce = artifacts.require("./TokenAce.sol");
const FeeAccount = artifacts.require("./FeeAccount.sol");
const InterestEarnedAccount = artifacts.require("./InterestEarnedAccount.sol");

module.exports = async function(deployer, network, accounts) {
    deployer.link(SafeMath, TokenAce);
    await deployer.deploy(
        TokenAce,
        FeeAccount.address,
        InterestEarnedAccount.address,
        2000 /* transferFeePt in parts per million = 0.2% */,
        200 /* min: 0.02 ACE */,
        50000 /* max fee: 5 ACE */
    );

    const tokenAce = TokenAce.at(TokenAce.address);
    await tokenAce.grantMultiplePermissions(accounts[0], ["MonetaryBoard"]);
};
