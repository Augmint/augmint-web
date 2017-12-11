/* Contract ONLY for testing */
pragma solidity ^0.4.18;
import "../generic/AugmintToken.sol";


contract TokenAcdMock is AugmintToken {
    string public constant name = "Augmint TEST Crypto Dollar";
    string public constant symbol = "ACDTest";
    uint8 public constant decimals = 4; // TODO: check if 4 enough - assuming rate will be around USD

    function TokenAcdMock(address _feeAccount, address _interestPoolAccount, address _interestEarnedAccount,
            uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax) public {
        feeAccount = _feeAccount;
        interestPoolAccount = _interestPoolAccount;
        interestEarnedAccount = _interestEarnedAccount;
        transferFeePt = _transferFeePt;
        transferFeeMin = _transferFeeMin;
        transferFeeMax = _transferFeeMax;
    }

    function withdrawTokens(address _to, uint _amount) external restrict("withdrawTokens") {
        require(_amount <= balances[this]);
        balances[this] = balances[this].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
    }
}
