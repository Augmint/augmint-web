/* Contract ONLY for testing */
pragma solidity 0.4.18;
import "../generic/AugmintToken.sol";


contract TokenAcdMock is AugmintToken {
    string public constant name = "Augmint TEST Crypto Dollar"; // solhint-disable-line const-name-snakecase
    string public constant symbol = "ACDTest"; // solhint-disable-line const-name-snakecase
    uint8 public constant decimals = 4; // solhint-disable-line const-name-snakecase

    function TokenAcdMock(address _feeAccount, address _interestPoolAccount, address _interestEarnedAccount,
        uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax) public AugmintToken(
        _feeAccount, _interestPoolAccount, _interestEarnedAccount,
        _transferFeePt, _transferFeeMin, _transferFeeMax ) { // solhint-disable-line no-empty-blocks
    }

    function issue(uint amount) external restrict("issue") {
        totalSupply = totalSupply.add(amount);
        balances[this] = balances[this].add(amount);
        TokenIssued(amount);
    }

    function burn(uint amount) external restrict("burn") {
        require(amount <= balances[this]);
        totalSupply = totalSupply.sub(amount);
        balances[this] = balances[this].sub(amount);
        TokenBurned(amount);
    }

    function withdrawTokens(address _to, uint _amount) external restrict("withdrawTokens") {
        require(_amount <= balances[this]);
        balances[this] = balances[this].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
    }

}
