/* Contract to manage Acd loan contracts
    TODO: payback collateral over the UCD value less default fee
    TODO: add loanId to disbursement, repay and collection narrative
*/
pragma solidity ^0.4.18;

import "./generic/Owned.sol";
import "./Rates.sol";
import "./generic/AugmintToken.sol"; /* TODO: shall we use AugmintTokenInterface instead? */
import "./interfaces/LoanManagerInterface.sol";


contract LoanManager is LoanManagerInterface {
    Rates public rates; // instance of ETH/USD rate provider contract
    AugmintToken public augmintToken; // instance of UCD token contract

    event NewLoan(uint8 productId, uint loanId, address borrower, uint collateralAmount, uint loanAmount,
        uint repaymentAmount);

    event LoanRepayed(uint loanId, address borrower);
    
    event LoanCollected(uint loanId, address borrower);

    function LoanManager(address _augmintTokenAddress, address _ratesAddress) public Owned() {
        augmintToken = AugmintToken(_augmintTokenAddress);
        rates = Rates(_ratesAddress);
    }

    function getLoanCount() external view returns (uint ct) {
        return loans.length;
    }

    function getProductCount() external view returns (uint ct) {
        return products.length;
    }

    function getLoanIds(address borrower) external view returns (uint[] loans) {
        return mLoans[borrower];
    }

    function addProduct(uint _term, uint _discountRate, uint _collateralRatio, uint _minDisbursedAmount,
            bool _isActive) external onlyOwner returns (uint newProductId) {
        newProductId = products.push(
            LoanProduct(_term, _discountRate, _collateralRatio, _minDisbursedAmount, _isActive)
        );

        return newProductId - 1;
        // TODO: emit event
    }

    function disableProduct(uint8 productId) external onlyOwner {
        products[productId].isActive = false;
        // TODO: emit event
    }

    function enableProduct(uint8 productId) external onlyOwner {
        products[productId].isActive = true;
        // TODO: emit event
    }

    function newEthBackedLoan(uint8 productId) external payable {
        require(products[productId].isActive); // valid productId?

        // calculate UCD loan values based on ETH sent in with Tx
        uint usdcValue = rates.convertWeiToUsdc(msg.value);
        uint repaymentAmount = usdcValue.mul(products[productId].collateralRatio).roundedDiv(100000000);
        repaymentAmount = repaymentAmount * 100;  // rounding 4 decimals value to 2 decimals.
                                        // no safe mul needed b/c of prev divide

        uint mul = products[productId].collateralRatio.mul(products[productId].discountRate) / 1000000;
        uint loanAmount = usdcValue.mul(mul).roundedDiv(100000000);
        loanAmount = loanAmount * 100;    // rounding 4 decimals value to 2 decimals.
                                                    // no safe mul needed b/c of prev divide

        require(loanAmount >= products[productId].minDisbursedAmount);

        // Create new loan
        uint loanId = loans.push(
            LoanData(msg.sender, LoanState.Open, msg.value, repaymentAmount, loanAmount,
                repaymentAmount.sub(loanAmount), products[productId].term, now, now + products[productId].term)
            ) - 1;

        // Store ref to new loan
        mLoans[msg.sender].push(loanId);

        // Issue ACD and send to borrower
        uint interestAmount;
        if (repaymentAmount > loanAmount) {
            interestAmount = repaymentAmount.sub(loanAmount);
        }
        augmintToken.issueAndDisburse(msg.sender, loanAmount, interestAmount, "Loan disbursement");

        NewLoan(productId, loanId, msg.sender, msg.value, loanAmount, repaymentAmount);
    }

    function releaseCollateral(uint loanId) external {
        require(loans[loanId].borrower == msg.sender || msg.sender == address(augmintToken));
        require(loans[loanId].state == LoanState.Open);
        require(now <= loans[loanId].maturity);
        loans[loanId].state = LoanState.Repaid;
        augmintToken.repayAndBurn(loans[loanId].borrower, loans[loanId].repaymentAmount,
            loans[loanId].interestAmount, "Loan repayment");
        loans[loanId].borrower.transfer(loans[loanId].collateralAmount); // send back ETH collateral

        LoanRepayed(loanId, loans[loanId].borrower);
    }

    function collect(uint[] loanIds) external {
        /* when there are a lots of loans to be collected then
             the client need to call it in batches to make sure tx won't exceed block gas limit.
         Anyone can call it - can't cause harm as it only allows to collect loans which they are defaulted
        */
        for (uint i = 0; i < loanIds.length; i++) {
            uint loanId = loanIds[i];
            require(loans[loanId].state == LoanState.Open);
            require(now >= loans[loanId].maturity);
            loans[loanId].state = LoanState.Defaulted;
            // send ETH collateral to augmintToken reserve
            address(augmintToken).transfer(loans[loanId].collateralAmount);

            loans[loanId].state = LoanState.Defaulted;
            // move interest from InterestPoolAccount to MIR (augmintToken reserve)
            augmintToken.moveCollectedInterest(loans[loanId].interestAmount);
            LoanCollected(loanId, loans[loanId].borrower);
        }

    }

}
