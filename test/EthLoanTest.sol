pragma solidity ^0.4.11;

import "./Owned.sol";
import "./Rates.sol";
import "./TokenUcd.sol";
import "./EthBackedLoan.sol";
import "./LoanManager.sol";

contract EthLoanTest {
    address public rateAddress;
    address public tokenUcdAddress;
    address public loanManagerAddress;

    function EthLoanTest() {
        rateAddress = new Rates();
        tokenUcdAddress = new TokenUcd();
        loanManagerAddress = new LoanManager(tokenUcdAddress, rateAddress );
        LoanManager(loanManagerAddress).addProduct(1, 900000, 600000, 100000, 10, true);
        TokenUcd(tokenUcdAddress).setLoanManagerAddress(loanManagerAddress);
    }
}
