/* Augmint Crypto Dollar token (ACD) implementation */
pragma solidity 0.4.18;
import "./generic/AugmintToken.sol";


contract TokenAce is AugmintToken {
    function TokenAce(address _feeAccount, address _interestPoolAccount, address _interestEarnedAccount,
        uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax)
    public AugmintToken("Augmint Crypto Euro", "ACE", "EUR", 4, _feeAccount, _interestPoolAccount,
        _interestEarnedAccount, _transferFeePt, _transferFeeMin, _transferFeeMax )
    {} // solhint-disable-line no-empty-blocks

}
