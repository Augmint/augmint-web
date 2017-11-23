/* Contract to temporarly hold "unearned" interest of not defaulted (and collected) or not yet repaid loans
    Interest moved to this account on disbursment
    On repayment interest moves to InterestEarningsAccount
    If loan defaults then interest moves to MIR (Market Intervention Reserve held in TokenUcd contract)
 */

pragma solidity ^0.4.18;

import "./generic/SystemAccount.sol";


contract InterestPoolAccount is SystemAccount {

}
