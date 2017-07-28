var TokenUcd = artifacts.require("./TokenUcd.sol");
var Rates = artifacts.require("./Rates.sol");
var LoanManager = artifacts.require("./LoanManager.sol");

module.exports = function(deployer, network) {
    TokenUcd.deployed()
    .then( res => {
        res.setLoanManagerAddress(LoanManager.address);
        var onTestRpc = web3.version.network == 999 ? true : false;
        if( onTestRpc) {
            console.log("   On testrpc. Adding test loanProducts ");
            LoanManager.deployed()
            .then( res => {
                // term (in sec), discountRate, loanCoverageRatio, minLoanAmountInUcd (w/ 4 decimals), gracePerdio, isActive
                res.addProduct( 1, 950000, 800000, 200000, 1, true);
                res.addProduct(60, 900000, 600000, 100000, 60, true);
            });
        }
    });
};
