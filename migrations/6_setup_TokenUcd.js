var TokenUcd = artifacts.require("./TokenUcd.sol");
var LoanManager = artifacts.require("./LoanManager.sol");

module.exports = async function(deployer, network) {
    try {
        let tokenUcd = await TokenUcd.deployed();
        return await tokenUcd.setLoanManagerAddress(LoanManager.address);
    } catch (error) {
        console.log("error in setup_TokenUcd", error);
        return Promise.reject(error);
    }
};
