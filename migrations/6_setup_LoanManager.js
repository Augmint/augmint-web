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
                // term (in sec), discountRate, loanCoverageRatio, minDisbursedAmountInUcd (w/ 4 decimals), gracePerdio, isActive
                res.addProduct(31536000 /* 365d */, 800000, 800000, 300000, 864000, true);
                res.addProduct(15552000 /* 180d */, 850000, 800000, 300000, 259200, true);
                res.addProduct( 7776000 /*  90d */, 910000, 800000, 300000, 172800, true);
                res.addProduct( 2592000 /*  30d */, 950000, 800000, 300000,  86400, true);
                res.addProduct(   86400 /*   1d */, 970000, 850000, 300000,   3600, true);
                res.addProduct(       1 /*   1m */, 985000, 900000, 200000,   3600, true); // due in 1 sec, repay in 1hr for testing
                res.addProduct(       1 /*   1s */, 990000, 950000, 100000,      1, true); // defaults in 2 secs for testing
            });
        }
    });
};
