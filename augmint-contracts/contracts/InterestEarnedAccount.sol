/* Contract to temporarly hold "unearned" interest of not defaulted (and collected) or not yet repaid loans
    Interest moved to this account on disbursment
    On repayment interest moves to InterestEarningsAccount
    If loan defaults then interest moves to MIR (Market Intervention Reserve held in AugmntToken contract)
 */

pragma solidity 0.4.19;
import "./generic/SystemAccount.sol";


contract InterestEarnedAccount is SystemAccount { // solhint-disable-line no-empty-blocks

}
