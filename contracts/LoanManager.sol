/* Contract to manage UCD loan contracts
    TODO: store loanId (idx in loanPointers)  in EthBackedLoan
    TODO: consider to add early repayment
    TODO: consider to allow partial repayment (eg. 60% repaid, 40% default )
*/
pragma solidity ^0.4.11;
import "./Owned.sol";
import "./Rates.sol";
import "./TokenUcd.sol";
import "./EthBackedLoan.sol";

contract LoanManager is owned {
    int8 public constant SUCCESS = 1;
    int8 public constant ERR_NOT_OWNER = -2;
    int8 public constant ERR_NO_LOAN = -3;
    int8 public constant ERR_LOAN_NOT_OPEN = -4;

    int8 public constant ERR_EXT_ERRCODE_BASE = -10;

    Rates public rates; // instance of ETH/USD rate provider contract
                        // TODO:  setter to be able to change? (consider trust questions)
    TokenUcd public tokenUcd; // instance of UCD token contract

    struct Product {
        uint term;
        uint discountRate; // discountRate in parts per million , ie. 10,000 = 1%
        uint loanCollateralRatio;  // ucd loan amount / colleteral usd value
                                    // in parts per million , ie. 10,000 = 1%
        uint minDisbursedAmountInUcd; // with 4 decimals, ie. 31000 = 3.1UCD
        uint repayPeriod; // number of seconds after maturity before collect can be executed
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

    function getLoanIds(address borrower) constant returns (uint[] loans) {
        return m_loanPointers[borrower];
    }

    function addProduct(uint _term, uint _discountRate, uint _loanCollateralRatio,
            uint _minDisbursedAmountInUcd, uint _repayPeriod, bool _isActive) onlyOwner returns (uint newProductId) {
        newProductId = products.push( Product( {term: _term, discountRate: _discountRate,
                loanCollateralRatio: _loanCollateralRatio, minDisbursedAmountInUcd: _minDisbursedAmountInUcd,
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

    event e_newLoan(uint8 productId, uint loanId, address borrower, address loanContract, uint disbursedLoanInUcd );
    function newEthBackedLoan(uint8 productId) payable {
        // valid productId?
        require( products[productId].isActive);

        // calculate UCD loan values based on ETH sent in with Tx
        uint usdValue = rates.convertWeiToUsd(msg.value);
        uint ucdDueAtMaturity = usdValue * products[productId].loanCollateralRatio / 1000000;
        uint disbursedLoanInUcd = ucdDueAtMaturity * products[productId].discountRate / 1000000;
        require(disbursedLoanInUcd >= products[productId].minDisbursedAmountInUcd);

        // Create new loan contract
        uint loanId = loanPointers.push( LoanPointer(address(0), LoanState.Open) ) - 1;
        // TODO: check if it's better to pass productId or Product struct
        address loanContractAddress = new EthBackedLoan(loanId, msg.sender, products[productId].term,
                    disbursedLoanInUcd, ucdDueAtMaturity, products[productId].repayPeriod);
        loanPointers[loanId].contractAddress = loanContractAddress;

        // Store ref to new loan contract in this contract
        m_loanPointers[msg.sender].push(loanId );

        // Send ETH collateral to loan contract
        loanContractAddress.transfer(msg.value);

        // Issue UCD and send to borrower
        int8 res = tokenUcd.issueAndDisburseUcd( msg.sender, ucdDueAtMaturity, disbursedLoanInUcd);
        if( res != tokenUcd.SUCCESS()) {
            revert(); // can't return error code b/c changes need to be reverted
        }

        e_newLoan(productId, loanId, msg.sender, loanContractAddress, disbursedLoanInUcd );
    }

    event e_error(int8 errorCode);
    event e_repayed(address loanContractAddress, address borrower);
    function repay(uint loanId) returns (int8 result) {
        // TODO: remove contract from loanPointers & m_loanPointer on SUCCESS
        // TODO: check if we could do this without "direct" access to borrower's UCD balance
        //       eg. transfer UCD to loanContract initiates repayment? or using ECR20 transfer approval?
        //       it wouldn't restrict access more but would be better seperation of functions
        if(loanPointers.length < loanId + 1) {
            e_error(ERR_NO_LOAN);
            return ERR_NO_LOAN;
        }

        if(loanPointers[loanId].loanState != LoanState.Open) {
            e_error(ERR_LOAN_NOT_OPEN);
            return ERR_LOAN_NOT_OPEN;
        }

        if(m_loanPointers[msg.sender].length == 0) {
            e_error(ERR_NOT_OWNER);
            return ERR_NOT_OWNER;
        }

        address loanContractAddress = loanPointers[ loanId ].contractAddress;
        EthBackedLoan loanContract = EthBackedLoan( loanContractAddress );

        if(loanContract.owner() != msg.sender) {
            e_error(ERR_NOT_OWNER);
            return ERR_NOT_OWNER;
        }

        int8 res = tokenUcd.repayAndBurnUcd(msg.sender, loanContract.ucdDueAtMaturity());
        if(res != tokenUcd.SUCCESS() ) {
            // no state changes can happen up to this point
            // ie. no revert required
            e_error(ERR_EXT_ERRCODE_BASE + res);
            return ERR_EXT_ERRCODE_BASE + res;
        }

        res = loanContract.repay();
        if (res != loanContract.SUCCESS() ) {
            // revert required as previous steps made state changes
           revert();
        }

        loanPointers[loanId].loanState = LoanState.Repaid;
        e_repayed(loanContractAddress, loanContract.owner());
        return SUCCESS;
    }

    event e_collected(address borrower, address loanContractAddress);
    function collect(uint[] loanIds) returns (int8 result) {
        /* when there are a lots of loans to be collected then
             the client need to call it in batches to make sure tx won't exceed block gas limit.
         Anyone can call it - can't cause harm as it only allows to collect loans which they are defaulted
         TODO: remove contract from loanPointers & m_loanPointer on SUCCESS
        */
        if(loanPointers.length == 0) {
            e_error(ERR_NO_LOAN);
            return ERR_NO_LOAN;
        }
        for (uint i = 0; i < loanIds.length; i++) {
            uint loanId = loanIds[i];
            if (loanPointers.length <= loanId) {
                e_error(ERR_NO_LOAN);
                return ERR_NO_LOAN;
            }
            if(loanPointers[loanId].loanState != LoanState.Open) {
                e_error(ERR_LOAN_NOT_OPEN);
                return ERR_LOAN_NOT_OPEN;
            }

            address loanContractAddress = loanPointers[ loanId ].contractAddress;
            EthBackedLoan loanContract = EthBackedLoan( loanContractAddress );

            int8 res = loanContract.collect();
            if (res != loanContract.SUCCESS() ) {
                // if EthBackedLoan.collect returned an error then no state changes could have happen yet
                // ie. no revert required
                e_error(ERR_EXT_ERRCODE_BASE + res);
                return ERR_EXT_ERRCODE_BASE + res;
            }

            loanPointers[loanId].loanState = LoanState.Defaulted;
            e_collected(loanContract.owner(), loanContractAddress);
        }
        return SUCCESS;
    }

}
