var TokenAcd = artifacts.require("./TokenAcd.sol");
var LoanManager = artifacts.require("./LoanManager.sol");

module.exports = async function(deployer, network) {
    try {
        let tokenAcd = await TokenAcd.deployed();
        return await tokenAcd.setLoanManagerAddress(LoanManager.address);
    } catch (error) {
        console.log("error in setup_TokenAcd", error);
        return Promise.reject(error);
    }
};
