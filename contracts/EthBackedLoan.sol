/* contract for each loan given in ACD for ETH collateral
    holds ETH collateral in contract balance, only allows access to it on maturity
    TODO: split it into AugmintLoan - EthBackedACDLoan ? generic loan contract interface contract ?
    TODO: double check against reentrancy
    TODO: consider storing collateral amount when loan created for easier tracking after repayment
    TODO: consider store loanId (maintened in loanManager)
    TODO: consider moving all repay functionality here from loanManager to make it self contained
         - would need to remove state from loanManager (so wouldn't need to call loanManager for housekeeping)
         - it would call tokenUcd directly, TBD: how would tokenUcd check permission if it doesn't know about contracts
         - consider sending UCD to this loanContract  first?
    TODO: consider moving functions to a library to reduce gas costs
*/

pragma solidity ^0.4.18;

import "./SafeMath.sol";
import "./TokenAcd.sol";
import "./LoanManager.sol";


contract EthBackedLoan {
    using SafeMath for uint256;
    enum LoanState { Open, Repaid, Defaulted } // TODO: move this to a lib (used by TokenUcd too)
    address public owner; // the borrower
    LoanManager public loanManager; // loan manager contract instance
    TokenAcd public tokenUcd; // tokenAcd instance

    LoanState public loanState; // TODO: make LoanState a getter which calculates state
    uint public loanId;
    uint public ucdDueAtMaturity; // nominal loan amount in UCD (non discounted amount)
    uint public disbursedLoanInUcd;
    uint public term; // duration of loan
    uint public disbursementDate;
    uint public maturity; // disbursementDate + term
    uint public repayPeriod; // number of seconds after maturity before collect can be executed

    function() external payable { } // to accept ETH collateral sent
    // TODO: should it refuse any other amount sent after?
    //       doens't seem to be a real issue as all ETH is going to be release after maturity anyway..

    function EthBackedLoan(uint _loanId, address _borrower, uint _term, uint _disbursedLoanInUcd,
                            uint _ucdDueAtMaturity, uint _repayPeriod) public {
        loanId = _loanId;
        loanManager = LoanManager(msg.sender);
        owner = _borrower;
        tokenUcd = loanManager.tokenUcd();
        term = _term;
        disbursementDate = now;
        maturity = disbursementDate.add(term);
        repayPeriod = _repayPeriod;
        disbursedLoanInUcd = _disbursedLoanInUcd;
        ucdDueAtMaturity = _ucdDueAtMaturity;
        loanState = LoanState.Open;
    }

    function getDetails() external view returns (
                                    address _owner,
                                    LoanManager _loanManager,
                                    TokenAcd _tokenUcd,
                                    LoanState _loanState,
                                    uint _ucdDueAtMaturity,
                                    uint _disbursedLoanInUcd,
                                    uint _term,
                                    uint _disbursementDate,
                                    uint _maturity,
                                    uint _repayPeriod,
                                    uint _loanId
        ) {
        return (
            owner, // 0 the borrower
            loanManager, // 1 loan manager contract instance
            tokenUcd, // 2 tokenUcd instance
            loanState, // 3
            ucdDueAtMaturity, // 4 nominal loan amount in UCD (non discounted amount)
            disbursedLoanInUcd, // 5
            term, // 6 duration of loan
            disbursementDate, // 7
            maturity, // 8 disbursementDate + term
            repayPeriod, // 9
            loanId // 10
        );
    }

    function releaseCollateral() external {
        require(msg.sender == address(loanManager)); // repayment is only through loanManager
        require(loanState == LoanState.Open);
        require(now >= maturity);
        require(now <= maturity.add(repayPeriod));
        loanState = LoanState.Repaid;
        owner.transfer(this.balance); // send back ETH collateral held in this contract
    }

    function collect() external {
        /* TODO: payback collateral over the UCD value less default fee */
        require(msg.sender == address(loanManager));
        require(loanState == LoanState.Open);
        require(now >= maturity.add(repayPeriod));
        loanState = LoanState.Defaulted;
        // send ETH collateral to tokenUcd reserve
        address(tokenUcd).transfer(this.balance);
    }


}
