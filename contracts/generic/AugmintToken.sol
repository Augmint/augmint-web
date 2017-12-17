/* Generic Augmint Token implementation (ERC20 token)
    This contract manages:
        * Balances of Augmint holders and transactions between them
        * Issues and burns tokens
            - manually by the contract owner or
            - automatically when new loan issued or repaid
        * Holds  reserves:
            - ETH as regular ETH balance of the contract
            - ERC20 token reserve (stored as regular Token balance under the contract address)
            TODO: separate reserve contract ?

        Note that all reserves are held under the contract address,
          therefore any transaction on the reserve is limited to the tx-s defined here
          (ie. transfer of reserve is not possible by the contract owner)
    TODO: ERC20 short address attack protection? https://github.com/DecentLabs/dcm-poc/issues/62
    TODO: ERC20 transferFrom attack protection: https://github.com/DecentLabs/dcm-poc/issues/57
    TODO: check more security best practices, eg: https://github.com/ConsenSys/smart-contract-best-practices,
                        https://github.com/OpenZeppelin/zeppelin-solidity
                        https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts/token
    TODO: function should be ordered according to Solidity style guide
*/
pragma solidity ^0.4.18;
import "./Restricted.sol";
import "../interfaces/AugmintTokenInterface.sol";


contract AugmintToken is AugmintTokenInterface {
    uint public totalSupply;

    mapping(address => uint256) public balances; // Balances for each account
    mapping(address => mapping (address => uint256)) public allowed; // allowances added with approve()

    address public feeAccount;
    address public interestPoolAccount;
    address public interestEarnedAccount;
    uint public transferFeePt; // in parts per million , ie. 2,000 = 0.2%
    uint public transferFeeMin; // with base unit of augmint token, eg. 4 decimals for TokenACD, 31000 = 3.1ACD
    uint public transferFeeMax; // with base unit of augmint token, eg. 4 decimals for TokenACD, 31000 = 3.1ACD

    event TokenIssued(uint amount);
    event TokenBurned(uint amount);
    event SystemAccountsChanged(address newFeeAccount, address newInteresPoolAccount, address newInterestEarnedAccount);
    event TransferFeesChanged(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax);

    function AugmintToken(address _feeAccount, address _interestPoolAccount, address _interestEarnedAccount,
        uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax) public {
        require(_feeAccount != 0);
        require(_interestPoolAccount != 0);
        require(_interestEarnedAccount != 0);
        feeAccount = _feeAccount;
        interestPoolAccount = _interestPoolAccount;
        interestEarnedAccount = _interestEarnedAccount;
        transferFeePt = _transferFeePt;
        transferFeeMin = _transferFeeMin;
        transferFeeMax = _transferFeeMax;
    }

    function () public payable { // solhint-disable-line no-empty-blocks
        // to accept ETH sent into reserve (from defaulted loan's collateral )
        /* TODO: shall we put protection against accidentally sending in ETH? */
    }

    function newLoan(address borrower, uint loanAmount, uint interestAmount, string narrative)
    external restrict("newLoan") {
        // FIXME: to be implemented
        require(borrower != 0);
        require(loanAmount != 0);
        require(interestAmount != 0);
        require(bytes(narrative).length != 0);
        revert();
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

    function transferWithNarrative(address _to, uint256 _amount, string _narrative) external {
        _transfer(msg.sender, _to, _amount, _narrative, getFee(_amount));
    }

    function transferNoFee(address _from, address _to, uint256 _amount, string _narrative)
    external restrict("transferNoFee") {
        _transfer(_from, _to, _amount, _narrative, 0);
    }

    function setSystemAccounts(address newFeeAccount, address newInteresPoolAccount,
            address newInterestEarnedAccount) external restrict("setSystemAccounts") {
        require(newFeeAccount != 0);
        require(newInteresPoolAccount != 0);
        require(newInterestEarnedAccount != 0);
        feeAccount = newFeeAccount;
        interestPoolAccount = newInteresPoolAccount;
        interestEarnedAccount = newInterestEarnedAccount;
        SystemAccountsChanged(newFeeAccount, newInteresPoolAccount, newInterestEarnedAccount);
    }

    function setTransferFees(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax)
    external restrict("setTransferFees") {
        transferFeePt = _transferFeePt;
        transferFeeMin = _transferFeeMin;
        transferFeeMax = _transferFeeMax;
        TransferFeesChanged(transferFeePt, transferFeeMin, transferFeeMax);
    }

    function balanceOf(address _owner) public view returns (uint256 balance) {
        return balances[_owner];
    }

    function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
        return allowed[_owner][_spender];
    }

    function transfer(address _to, uint256 _amount) public returns (bool) {
        _transfer(msg.sender, _to, _amount, "", getFee(_amount));
        return true;
    }

    function approve(address _spender, uint256 _amount) public returns (bool) {
        require(msg.sender != _spender); // no need to approve for myself. Makes client code simpler if we don't allow
        allowed[msg.sender][_spender] = _amount;
        Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
     approve should be called when allowed[_spender] == 0. To increment allowed value is better
     to use this function to avoid 2 calls (and wait until the first transaction is mined)
     From MonolithDAO Token.sol */
    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        require(msg.sender != _spender); // no need to approve for myself. Makes client code simpler if we don't allow
        allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
        require(msg.sender != _spender); // no need to approve for myself. Makes client code simpler if we don't allow
        uint oldValue = allowed[msg.sender][_spender];
        if (_subtractedValue > oldValue) {
            allowed[msg.sender][_spender] = 0;
        } else {
            allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
        }
        Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public returns (bool) {
        _transferFrom(_from, _to, _amount, "", getFee(_amount));
        return true;
    }

    function transferFromWithNarrative(
        address _from,
        address _to,
        uint256 _amount,
        string _narrative
    ) public {
        _transferFrom(_from, _to, _amount, _narrative, getFee(_amount));
    }

    function transferFromNoFee(address _from, address _to, uint256 _amount, string _narrative)
    public restrict("transferFromNoFee") {
        _transferFrom(_from, _to, _amount, _narrative, 0);
    }

    function getFee(uint amount) internal view returns (uint256 fee) {
        fee = amount.mul(transferFeePt).div(1000000);
        if (fee > transferFeeMax) {
            fee = transferFeeMax;
        } else if (fee < transferFeeMin) {
            fee = transferFeeMin;
        }
        return fee;
    }

    function _transferFrom(address _from, address _to, uint256 _amount, string _narrative, uint _fee) internal {
        require(balances[_from] >= _amount);
        require(allowed[_from][msg.sender] >= _amount);
        require(_amount > 0);

        _transfer(_from, _to, _amount, _narrative, 0);
        if (_fee > 0) {
            /* we need to deduct fee from _to unlike normal transfer
             TODO: better way to do this? E.g. allow transfer fee to be deducted from beneficiary? */
            _transfer(_to, feeAccount, _fee, "TransferFrom fee", 0);
        }

        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);
    }

    function _transfer(address _from, address _to, uint256 _amount, string narrative, uint _fee) internal {
        require(_from != _to); // no need to send to myself. Makes client code simpler if we don't allow
        require(_amount > 0);
        if (_fee > 0) {
            balances[feeAccount] = balances[feeAccount].add(_fee);
            balances[_from] = balances[_from].sub(_amount).sub(_fee);
        } else {
            balances[_from] = balances[_from].sub(_amount);
        }
        balances[_to] = balances[_to].add(_amount);
        Transfer(_from, _to, _amount, narrative, _fee);
    }

}
