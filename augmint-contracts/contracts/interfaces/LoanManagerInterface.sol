/* TODO: shall we move more functions here from LoanManager ? */

pragma solidity 0.4.19;
import "../generic/Restricted.sol";
import "../generic/SafeMath.sol";


contract LoanManagerInterface is Restricted {
    using SafeMath for uint256;

    enum LoanState { Open, Repaid, Defaulted }

    struct LoanProduct {
        uint term; // 0
        uint discountRate; // 1: discountRate in parts per million , ie. 10,000 = 1%
        uint collateralRatio;   // 2: loan token amount / colleteral pegged ccy value
                                // in parts per million , ie. 10,000 = 1%
        uint minDisbursedAmount; // 3: with 4 decimals, e.g. 31000 = 3.1ACE
        uint defaultingFeePt; // 4: % of collateral in parts per million , ie. 50,000 = 5%
        bool isActive; // 5
    }

    struct LoanData {
        address borrower; // 0
        LoanState state; // 1
        uint collateralAmount; // 2
        uint repaymentAmount; // 3
        uint loanAmount; // 4
        uint interestAmount; // 5
        uint term; // 6
        uint disbursementDate; // 7
        uint maturity; // 8
        uint defaultingFeePt; // 9
    }

    LoanProduct[] public products;

    LoanData[] public loans;
    mapping(address => uint[]) public mLoans;  // owner account address =>  array of loan Ids

    function releaseCollateral(uint loanId) external;

}
