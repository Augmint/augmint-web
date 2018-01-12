"use strict";

const Locker = artifacts.require("./Locker.sol");
const TokenAce = artifacts.require("./TokenAce.sol");
const SafeMath = artifacts.require("./SafeMath.sol");

module.exports = function(deployer, network) {
    deployer.link(SafeMath, Locker);
    deployer.deploy(Locker, TokenAce.address);
    deployer.then(async () => {
        const tokenAce = TokenAce.at(TokenAce.address);
        await tokenAce.setLocker(Locker.address);
        await tokenAce.grantPermission(Locker.address, "transferNoFee");
    });
};
