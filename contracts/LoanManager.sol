/* Contract to manage Augmint token loan contracts backed by ETH
    TODO: add loanId to disbursement, repay and collection narrative
*/
pragma solidity 0.4.19;

import "./Rates.sol";
import "./interfaces/AugmintTokenInterface.sol";
import "./interfaces/LoanManagerInterface.sol";


contract LoanManager is LoanManagerInterface {
    Rates public rates; // instance of ETH/pegged currency rate provider contract
    AugmintTokenInterface public augmintToken; // instance of token contract

    event NewLoan(uint productId, uint loanId, address borrower, uint collateralAmount, uint loanAmount,
        uint repaymentAmount);

    event LoanProductActiveStateChanged(uint productId, bool newState);

    event LoanProductAdded(uint productId);

    event LoanRepayed(uint loanId, address borrower);

    event LoanCollected(uint indexed loanId, address indexed borrower, uint collectedCollateral,
        uint releasedCollateral, uint defaultingFee);

    function LoanManager(address _augmintTokenAddress, address _ratesAddress) public {
        augmintToken = AugmintTokenInterface(_augmintTokenAddress);
        rates = Rates(_ratesAddress);
    }

    function addLoanProduct(uint _term, uint _discountRate, uint _collateralRatio, uint _minDisbursedAmount,
        uint _defaultingFee, bool _isActive)
    external restrict("MonetaryBoard") returns (uint newProductId) {
        newProductId = products.push(
            LoanProduct(_term, _discountRate, _collateralRatio, _minDisbursedAmount, _defaultingFee, _isActive)
        ) - 1;

        LoanProductAdded(newProductId);
        return newProductId;
    }

    function setLoanProductActiveState(uint8 productId, bool newState)
    external restrict ("MonetaryBoard") {
        products[productId].isActive = false;
        LoanProductActiveStateChanged(productId, newState);
    }

    function newEthBackedLoan(uint8 productId) external payable {
        require(products[productId].isActive); // valid productId?

        // calculate loan values based on ETH sent in with Tx
        uint tokenValue = rates.convertFromWei(augmintToken.peggedSymbol(), msg.value);
        uint repaymentAmount = tokenValue.mul(products[productId].collateralRatio).roundedDiv(100000000);
        repaymentAmount = repaymentAmount * 100;  // rounding 4 decimals value to 2 decimals.
                                        // no safe mul needed b/c of prev divide

        uint mul = products[productId].collateralRatio.mul(products[productId].discountRate) / 1000000;
        uint loanAmount = tokenValue.mul(mul).roundedDiv(100000000);
        loanAmount = loanAmount * 100;    // rounding 4 decimals value to 2 decimals.
                                                    // no safe mul needed b/c of prev divide

        require(loanAmount >= products[productId].minDisbursedAmount);

        // Create new loan
        uint loanId = loans.push(
            LoanData(msg.sender, LoanState.Open, msg.value, repaymentAmount, loanAmount,
                repaymentAmount.sub(loanAmount), products[productId].term, now, now + products[productId].term,
                products[productId].defaultingFeePt)
            ) - 1;

        // Store ref to new loan
        mLoans[msg.sender].push(loanId);

        // Issue tokens and send to borrower
        uint interestAmount;
        if (repaymentAmount > loanAmount) {
            interestAmount = repaymentAmount.sub(loanAmount);
        }
        augmintToken.issueAndDisburse(msg.sender, loanAmount, "Loan disbursement");

        NewLoan(productId, loanId, msg.sender, msg.value, loanAmount, repaymentAmount);
    }

    /* users must call AugmintToken.repayLoan() to release collateral */
    function releaseCollateral(uint loanId) external {
        require(msg.sender == address(augmintToken));
        require(loans[loanId].state == LoanState.Open);
        require(now <= loans[loanId].maturity);
        loans[loanId].state = LoanState.Repaid;
        loans[loanId].borrower.transfer(loans[loanId].collateralAmount); // send back ETH collateral

        LoanRepayed(loanId, loans[loanId].borrower);
    }

    function collect(uint[] loanIds) external {
        /* when there are a lots of loans to be collected then
             the client need to call it in batches to make sure tx won't exceed block gas limit.
         Anyone can call it - can't cause harm as it only allows to collect loans which they are defaulted
         TODO: optimise these calculation
        */
        for (uint i = 0; i < loanIds.length; i++) {
            uint loanId = loanIds[i];
            require(loans[loanId].state == LoanState.Open);
            require(now >= loans[loanId].maturity);
            loans[loanId].state = LoanState.Defaulted;
            // send ETH collateral to augmintToken reserve
            uint defaultingFeeInToken = loans[loanId].repaymentAmount.mul(loans[loanId].defaultingFeePt).div(1000000);
            uint defaultingFee = rates.convertToWei(augmintToken.peggedSymbol(), defaultingFeeInToken);
            uint targetCollection = rates.convertToWei(augmintToken.peggedSymbol(), loans[loanId].repaymentAmount)
                .add(defaultingFee);
            uint releasedCollateral;
            if (targetCollection < loans[loanId].collateralAmount) {
                releasedCollateral = loans[loanId].collateralAmount.sub(targetCollection);
                loans[loanId].borrower.transfer(releasedCollateral);
            }
            uint collectedCollateral = loans[loanId].collateralAmount.sub(releasedCollateral);
            if (defaultingFee > collectedCollateral) {
                defaultingFee = collectedCollateral;
            }

            address(augmintToken).transfer(collectedCollateral);

            LoanCollected(loanId, loans[loanId].borrower, collectedCollateral, releasedCollateral, defaultingFee);
        }

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

}
