/* Contract ONLY for testing */
pragma solidity 0.4.19;
import "../generic/AugmintToken.sol";


contract TokenAceMock is AugmintToken {

    function TokenAceMock(address _feeAccount, address _interestEarnedAccount,
        uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax)
    public AugmintToken("Augmint TEST Crypto EUR", "ACET", "EUR", 4, _feeAccount,
        _interestEarnedAccount, _transferFeePt, _transferFeeMin, _transferFeeMax)
    {} // solhint-disable-line no-empty-blocks

    function withdrawTokens(address _to, uint _amount) external restrict("MonetaryBoard") {
        balances[this] = balances[this].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
    }

}
