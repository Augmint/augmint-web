/* contract for each loan given in UCD for ETH collateral
    holds ETH collateral in contract balance, only allows access to it on maturity
*/
pragma solidity ^0.4.13;

import "./TokenUcd.sol";
import "./LoanManager.sol";

contract EthBackedLoan {

    // TODO: consider a generic loan contract interface
    enum LoanState { Open, Repaid, Defaulted } // TODO: move this to a lib (used by TokenUcd too)
    address public owner; // the borrower
    LoanManager public loanManager; // loan manager contract instance
    TokenUcd public tokenUcd; // tokenUcd instance

    LoanState public loanState;
    uint public ucdDueAtMaturity; // nominal loan amount in UCD (non discounted amount)
    uint public disbursedLoanInUcd;
    uint public term; // duration of loan
    uint public disbursementDate;
    uint public maturity; // disbursementDate + term
    uint public gracePeriod; // number of seconds after maturity before default can be executed

    int8 public constant SUCCESS = 1;
    int8 public constant ERR_DEFAULT_NOT_DUE_YET = -1;
    int8 public constant ERR_REPAY_NOT_DUE_YET = -2;
    int8 public constant ERR_UCD_BALANCE_NOT_ENOUGH = -3;
    int8 public constant ERR_NOT_AUTHORISED = -4;
    int8 public constant ERR_LOAN_NOT_OPEN = -5;
    int8 public constant ERR_EXT_ERRCODE_BASE = -10; // used to pass on error code returned fro mexternal calls

    function() payable { } // to accept ETH collateral sent

    function EthBackedLoan(address _loanManager, address _borrower, uint _term, uint _disbursedLoanInUcd,
                            uint _ucdDueAtMaturity, uint _gracePeriod) {
        loanManager = LoanManager(_loanManager);
        owner = _borrower;
        tokenUcd = loanManager.tokenUcd();
        term = _term;
        disbursementDate = now;
        maturity = disbursementDate + term;
        gracePeriod = _gracePeriod;
        disbursedLoanInUcd = _disbursedLoanInUcd;
        ucdDueAtMaturity = _ucdDueAtMaturity;
        loanState = LoanState.Open;
    }

    function repay() returns (int8 result) {
        if( msg.sender != address(loanManager)) {
            // repayment is only through loanManager.
            // loanManager only allows owner to repay loan
            return ERR_NOT_AUTHORISED;
        }
        if(loanState != LoanState.Open) {
            return ERR_LOAN_NOT_OPEN;
        }

        if(now < maturity) {
            return ERR_REPAY_NOT_DUE_YET;
        }

        loanState = LoanState.Repaid;
         // send back collateral held in this contract
        owner.transfer(this.balance);

        return SUCCESS;
    }

    function defaulted() returns (int8 result) {
        if( msg.sender != address(loanManager)) {
            // default is only through loanManager
            return ERR_NOT_AUTHORISED;
        }

        if(loanState != LoanState.Open) {
            return ERR_LOAN_NOT_OPEN;
        }

        if(now < maturity + gracePeriod) {
            return ERR_DEFAULT_NOT_DUE_YET;
        }

        loanState = LoanState.Defaulted;
        // send ETH collateral to tokenUcd reserve
        address(tokenUcd).transfer(this.balance);

        return SUCCESS;
    }

    function sellLoan(address buyer, uint priceInUcd) returns (int8 result) {
        /* TODO: 2 steps process, offer/approve method TBD
        */
        buyer = buyer; // to silence complier warnings until it's implemented
        priceInUcd = priceInUcd;
        return -1;
    }

}
