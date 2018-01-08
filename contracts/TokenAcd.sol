/* Augmint Crypto Dollar token (ACD) implementation */
pragma solidity 0.4.18;
import "./generic/AugmintToken.sol";


contract TokenAcd is AugmintToken {
    string public constant name = "Augmint Crypto Dollar"; // solhint-disable-line const-name-snakecase
    string public constant symbol = "ACD"; // solhint-disable-line const-name-snakecase
    uint8 public constant decimals = 4; // solhint-disable-line const-name-snakecase

    function TokenAcd(address _feeAccount, address _interestPoolAccount, address _interestEarnedAccount,
        uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax) public AugmintToken(
        _feeAccount, _interestPoolAccount, _interestEarnedAccount,
        _transferFeePt, _transferFeeMin, _transferFeeMax ) { // solhint-disable-line no-empty-blocks
    }
}
