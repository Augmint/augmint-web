var TokenUcd = artifacts.require("./TokenUcd.sol");
//var testHelper = new require("./testHelper.js");

module.exports = {
    newTokenUcd: newTokenUcd
};

function newTokenUcd(initialUcdBalance) {
    return new Promise(async function(resolve, reject) {
        let instance = await TokenUcd.new();
        if (initialUcdBalance > 0) {
            await instance.issueUcd(initialUcdBalance);
            await instance.getUcdFromReserve(initialUcdBalance);
        }
        resolve(instance);
    });
}
