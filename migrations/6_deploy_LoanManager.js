var TokenAcd = artifacts.require("./TokenAcd.sol");
var Rates = artifacts.require("./Rates.sol");
var SafeMath = artifacts.require("./SafeMath.sol");
var LoanManager = artifacts.require("./LoanManager.sol");

module.exports = function(deployer, network, accounts) {
    deployer.link(SafeMath, LoanManager);
    deployer.deploy(LoanManager, TokenAcd.address, Rates.address);
    deployer.then(async () => {
        let lm = LoanManager.at(LoanManager.address);
        let tokenAcd = TokenAcd.at(TokenAcd.address);
        await tokenAcd.grantMultiplePermissions(LoanManager.address, [
            "issueAndDisburse",
            "repayAndBurn",
            "moveCollectedInterest",
            "LoanManager"
        ]);

        let onTest =
            web3.version.network == 999 ||
            web3.version.network == 4 ||
            web3.version.network == 3 ||
            web3.version.network == 1976 ||
            web3.version.network == 4447
                ? true
                : false;
        if (!onTest) {
            console.log(
                "   Not on a known test network. NOT adding test loanProducts. Network id: ",
                web3.version.network
            );
            return;
        }
        console.log("   On a test network. Adding test loanProducts. Network id: ", web3.version.network);
        // term (in sec), discountRate, loanCoverageRatio, minDisbursedAmount (w/ 4 decimals), defaultingFeePt, isActive
        await lm.addProduct(31536000, 800000, 800000, 300000, 50000, true); // due in 365d
        await lm.addProduct(15552000, 850000, 800000, 300000, 50000, true); // due in 180d
        await lm.addProduct(7776000, 910000, 800000, 300000, 50000, true); // due in 90d
        await lm.addProduct(2592000, 950000, 800000, 300000, 50000, true); // due in 30d
        await lm.addProduct(86400, 970000, 850000, 300000, 50000, true); // due in 1 day
        await lm.addProduct(3600, 985000, 900000, 200000, 50000, true); // due in 1hr for testing repayments
        await lm.addProduct(1, 990000, 950000, 100000, 50000, true); // defaults in 1 secs for testing
    });
};
