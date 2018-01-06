/* Contract ONLY for testing */
pragma solidity ^0.4.18;
import "../generic/AugmintToken.sol";


contract TokenAcdMock is AugmintToken {
    string public constant name = "Augmint TEST Crypto Dollar";
    string public constant symbol = "ACDTest";
    uint8 public constant decimals = 4; // TODO: check if 4 enough - assuming rate will be around USD

    function TokenAcdMock(address _feeAccount, address _interestPoolAccount, address _interestEarnedAccount,
        uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax) public AugmintToken(
        _feeAccount, _interestPoolAccount, _interestEarnedAccount,
        _transferFeePt, _transferFeeMin, _transferFeeMax ) {
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
