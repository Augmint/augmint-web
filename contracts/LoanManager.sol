/* Contract to manage UCD loan contracts
    TODO: consider to allow partial repayment (eg. 60% repaid, 40% default )
*/
pragma solidity ^0.4.11;
import "./Owned.sol";
import "./Rates.sol";
import "./TokenUcd.sol";
import "./EthBackedLoan.sol";

contract LoanManager is owned {
    int8 public constant SUCCESS = 1;
    int8 public constant ERR_NO_LOAN = -3;
    int8 public constant ERR_LOAN_NOT_OPEN = -4;
    int8 public constant ERR_EXT_ERRCODE_BASE = -10;

    Rates public rates; // instance of ETH/USD rate provider contract
                        // TODO:  setter to be able to change? (consider trust questions)
    TokenUcd public tokenUcd; // instance of UCD token contract

    struct Product {
        uint term;
        uint discountRate; // discountRate in parts per million , ie. 10,000 = 1%
        uint loanCoverageRatio;  // colleteral usd value / ucd loan amount
                                    // in parts per million , ie. 10,000 = 1%
                                    // TODO: it means 1/loanCoverageRatio, rename it accordingly
        uint minDisbursedAmountInUcd; // with 4 decimals, ie. 31000 = 3.1UCD
        uint repayPeriod; // number of seconds after maturity before default can be executed
        bool isActive;
    }

    Product[] public products;

    enum LoanState { Open, Repaid, Defaulted }

    struct LoanPointer { // TODO: better name for it...
        address contractAddress;
        LoanState loanState;  // Redundant, stored in loan contract as well but saves us to instantiate each contract when need to iterate through
    }

    LoanPointer[] public loanPointers;
    mapping(address => uint[]) public m_loanPointers;  // owner account address =>  array of loanContracts array idx-s (idx + 1)

    function LoanManager(address _tokenUcdAddress, address _ratesAddress) owned() {
        tokenUcd = TokenUcd(_tokenUcdAddress);
        rates = Rates(_ratesAddress);
    }

    function getLoanCount() constant returns (uint ct) {
        return loanPointers.length;
    }

    function getProductCount() constant returns (uint ct) {
        return products.length;
    }

    function addProduct(uint _term, uint _discountRate, uint _loanCoverageRatio,
            uint _minDisbursedAmountInUcd, uint _repayPeriod, bool _isActive) onlyOwner returns (uint newProductId) {
        newProductId = products.push( Product( {term: _term, discountRate: _discountRate,
                loanCoverageRatio: _loanCoverageRatio, minDisbursedAmountInUcd: _minDisbursedAmountInUcd,
                repayPeriod: _repayPeriod, isActive: _isActive }) );

        return newProductId - 1;
        // TODO: emit event
    }

    function disableProduct(uint8 productId) onlyOwner {
        products[productId].isActive = false;
        // TODO: emit event
    }

    function enableProduct(uint8 productId) onlyOwner {
        products[productId].isActive = true;
        // TODO: emit event
    }

    event e_newLoan(uint8 productId, address borrower, address loanContract, uint disbursedLoanInUcd );
    function newEthBackedLoan(uint8 productId) payable {
        // valid productId?
        require( products[productId].isActive);

        // calculate UCD loan values based on ETH sent in with Tx
        uint usdValue = rates.convertWeiToUsd(msg.value);
        uint ucdDueAtMaturity = usdValue * products[productId].loanCoverageRatio / 1000000;
        uint disbursedLoanInUcd = ucdDueAtMaturity * products[productId].discountRate / 1000000;
        require(disbursedLoanInUcd >= products[productId].minDisbursedAmountInUcd);

        // Create new loan contract
        // TODO: check if it's better to pass productId or Product struct
        address loanContractAddress = new EthBackedLoan(msg.sender, products[productId].term,
                    disbursedLoanInUcd, ucdDueAtMaturity, products[productId].repayPeriod);

        // Store ref to new loan contract in this contract
        uint idx = loanPointers.push( LoanPointer(loanContractAddress, LoanState.Open) );
        m_loanPointers[msg.sender].push(idx - 1 );

        // Send ETH collateral to loan contract
        loanContractAddress.transfer(msg.value);

        // Issue UCD and send to borrower
        int8 res = tokenUcd.issueAndDisburseUcd( msg.sender, ucdDueAtMaturity, disbursedLoanInUcd);
        if( res != tokenUcd.SUCCESS()) {
            revert(); // can't return error code b/c changes need to be reverted
        }

        e_newLoan(productId, msg.sender, loanContractAddress,disbursedLoanInUcd );
    }

    event e_repayed(address loanContractAddress);
    function repay(uint loanId) returns (int8 result) {
        // note that loanId is idx in borrower's array (ie. 0...n for each borrower)
        // TODO: remove contract from loanPointers & m_loanPointer on SUCCESS
        // TODO: check if we could do this without "direct" access to borrower's UCD balance
        //       eg. transfer UCD to loanContract initiates repayment? or using ECR20 transfer approval?
        //       it wouldn't restrict access more but would be better seperation of functions
        if(m_loanPointers[msg.sender].length == 0
            || m_loanPointers[msg.sender].length <= loanId) {
            return ERR_NO_LOAN;
        }

        uint loanIdx = m_loanPointers[msg.sender][loanId];
        if(loanPointers[loanIdx].loanState != LoanState.Open) {
            return ERR_LOAN_NOT_OPEN;
        }

        address loanContractAddress = loanPointers[ loanIdx ].contractAddress;
        EthBackedLoan loanContract = EthBackedLoan( loanContractAddress );

        int8 res = tokenUcd.repayAndBurnUcd(msg.sender, loanContract.ucdDueAtMaturity());
        if(res != tokenUcd.SUCCESS() ) {
            // no state changes can happen up to this point
            // ie. no revert required
            return ERR_EXT_ERRCODE_BASE + res;
        }

        res = loanContract.repay();
        if (res != loanContract.SUCCESS() ) {
            // revert required as previous steps made state changes
           revert();
        }

        loanPointers[loanIdx].loanState = LoanState.Repaid;
        e_repayed(loanContractAddress);
        return SUCCESS;
    }

    event e_defaulted(address loanContractAddress);
    function defaulted(uint loanIdx) returns (int8 result) {
        // note that loanIdx is idx in loanPointer[]  (ie. global idx for all loans 0...n )
        // anyone can call it.
        // TODO: remove contract from loanPointers & m_loanPointer on SUCCESS
        if(loanPointers.length == 0
            || loanPointers.length <= loanIdx) {
            return ERR_NO_LOAN;
        }
        if(loanPointers[loanIdx].loanState != LoanState.Open) {
            return ERR_LOAN_NOT_OPEN;
        }

        address loanContractAddress = loanPointers[ loanIdx ].contractAddress;
        EthBackedLoan loanContract = EthBackedLoan( loanContractAddress );

        int8 res = loanContract.defaulted();
        if (res != loanContract.SUCCESS() ) {
            // no state changes can happen up to this point
            // ie. no revert required
            return ERR_EXT_ERRCODE_BASE + res;
        }

        loanPointers[loanIdx].loanState = LoanState.Defaulted;
        e_defaulted(loanContractAddress);
        return SUCCESS;
    }

}
