const Locker = artifacts.require("./Locker.sol");
const TokenAEur = artifacts.require("./TokenAEur.sol");
const SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer, network) {
    deployer.link(SafeMath, Locker);
    deployer.deploy(Locker, TokenAEur.address);
    deployer.then(async () => {
        const tokenAEur = TokenAEur.at(TokenAEur.address);
        await tokenAEur.grantMultiplePermissions(Locker.address, ["LockerContracts", "NoFeeTransferContracts"]);
    });
};
