var TokenUcd = artifacts.require("./TokenUcd.sol");
var Rates = artifacts.require("./Rates.sol");
var LoanManager = artifacts.require("./LoanManager.sol");

module.exports = function(deployer, network) {
    var ratesInstance, tokenUcdInstance;
    Rates.deployed().then( res => {
        ratesInstance = res;
        return TokenUcd.deployed();
    }).then( res => {
        tokenUcdInstance = res;
        return deployer.deploy(LoanManager, tokenUcdInstance.address, ratesInstance.address);
    }).then( res => {
        return LoanManager.deployed();
    }).then( res => {
        tokenUcdInstance.setLoanManagerAddress(res.address);
        var onTestRpc = web3.version.network == 999 ? true : false;
        if( onTestRpc) {
            console.log("   On testrpc. Adding test loanProducts ");
            // term (in sec), discountRate, loanCoverageRatio, minLoanAmountInUcd (w/ 4 decimals), gracePerdio, isActive
            res.addProduct( 1, 950000, 800000, 200000, 1, true);
            res.addProduct(60, 900000, 600000, 100000, 60, true);
        }
    });
};
