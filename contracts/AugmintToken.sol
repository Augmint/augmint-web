/* Generic Augmint Token implementation (ERC20 token)
    This contract manages:
        * Balances of Augmint holders and transactions between them
        * Issues and burns tokens
            - manually by the contract owner or
            - automatically when new loan issued or repaid
        * Holds  reserves:
            - ETH as regular ETH balance of the contract
            - ERC20 token reserve (stored as regular Token balance under the contract address)
            TODO: separate reserve contract in order to hold any ERC20 token in one reserve

        Note that all reserves are held under the contract address,
          therefore any transaction on the reserve is limited to the tx-s defined here
          (ie. transfer of reserve is not possible by the contract owner)

    TODO: split this: ERC20 base - generic Augmint Token
    TODO: separate data from logic for code upgradeablity
    TODO: if we emit generic events from here then can we filter to specific AugmintTokens?
    TODO: decision making mechanism (ie. replace all onlyOwner)
    TODO: remove test functions (getFromReserve + restrict issue)
    TODO: check more security best practices, eg: https://github.com/ConsenSys/smart-contract-best-practices,
                        https://github.com/OpenZeppelin/zeppelin-solidity
                        https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts/token
*/
pragma solidity ^0.4.18;
import "./Owned.sol";
import "./SafeMath.sol";

contract AugmintToken is owned {
    using SafeMath for uint256;

    uint256 public totalSupply; // total amount of tokens

    // Balances for each account
    mapping(address => uint256) public balances;
    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) public allowed;

    address public loanManagerAddress; // used for authorisation of issuing ACD for loans
    address public exchangeAddress; // for authorisation of transferExchange()
    address public feeAccount;
    address public interestPoolAccount;
    address public interestEarnedAccount;
    uint public transferFeeDiv; // 1/transferFeeDiv %, eg. 500 = 0.2%
    uint public transferFeeMin; // with base unit of augmint token, eg. 4 decimals for TokenACD, 31000 = 3.1ACD
    uint public transferFeeMax; // with base unit of augmint token, eg. 4 decimals for TokenACD, 31000 = 3.1ACD

    /* TODO: TRUFFLE migrate fails on TokenAcd.deploy(...) if constructor is defined here
        function AugmintToken(address _feeAccount, uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax) public {
        feeAccount = _feeAccount;
        transferFeePt = _transferFeePt;
        transferFeeMin = _transferFeeMin;
        transferFeeMax = _transferFeeMax;
    }*/

    function () public payable {} // to accept ETH sent into reserve (from defaulted loan's collateral )
    // TODO: shall we put protection against accidentally sending in ETH?

    function balanceOf(address _owner) external view returns (uint256 balance) {
        return balances[_owner];
    }

    function getFee(uint amount) internal view returns (uint256 fee) {
        fee = amount.div(transferFeeDiv) ;
        if (fee > transferFeeMax ) {
            fee = transferFeeMax;
        } else if (fee < transferFeeMin) {
            fee = transferFeeMin;
        }
        return fee;
    }

    event e_loanManagerAddressChanged(address newAddress);

    function setLoanManagerAddress(address newAddress) external onlyOwner {
        loanManagerAddress = newAddress;
        e_loanManagerAddressChanged(newAddress);
    }

    event e_exchangeAddressChanged(address newAddress);

    function setExchangeAddress(address newAddress) external onlyOwner {
        exchangeAddress = newAddress;
        e_exchangeAddressChanged(newAddress);
    }

    event e_systemAccountsChanged(address newFeeAccount, address newInteresPoolAccount, address newInterestEarnedAccount);

    function setSystemAccounts(address newFeeAccount, address newInteresPoolAccount,
            address newInterestEarnedAccount) external onlyOwner {
        feeAccount = newFeeAccount;
        interestPoolAccount = newInteresPoolAccount;
        interestEarnedAccount = newInterestEarnedAccount;
        e_systemAccountsChanged(newFeeAccount, newInteresPoolAccount, newInterestEarnedAccount);
    }

    event e_transferFeesChanged(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax);
    function setTransferFees(uint _transferFeeDiv, uint _transferFeeMin, uint _transferFeeMax) external onlyOwner {
        transferFeeDiv = _transferFeeDiv;
        transferFeeMin = _transferFeeMin;
        transferFeeMax = _transferFeeMax;
    }

    event e_transfer(address indexed from, address indexed to, uint amount, string narrative, uint fee);

    function transfer(address _to, uint256 _amount) external {
        _transfer(msg.sender, _to, _amount, "", getFee(_amount));
    }

    function transferWithNarrative(address _to, uint256 _amount, string _narrative) external {
        _transfer(msg.sender, _to, _amount, _narrative, getFee(_amount));
    }

    function transferNoFee(address _from, address _to, uint256 _amount, string _narrative) public {
        require( msg.sender == exchangeAddress || msg.sender == loanManagerAddress);
        _transfer(_from, _to, _amount, _narrative, 0);
    }

    function _transfer(address _from, address _to, uint256 _amount, string narrative, uint _fee) internal {
        // TODO: add fee arg, calc fee and deduct fee if there is any
        require(_from != _to); // no need to send to myself. Makes client code simpler if we don't allow
        require(_amount > 0);
        if (_fee > 0) {
            balances[feeAccount] = balances[feeAccount].add(_fee);
            balances[_from] = balances[_from].sub(_amount).sub(_fee);
        } else {
            balances[_from] = balances[_from].sub(_amount);
        }
        balances[_to] = balances[_to].add(_amount);
        e_transfer(_from, _to, _amount, narrative, _fee);
    }

    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _amount) external returns (bool success) {
        require(msg.sender != _spender); // no need to approve for myself. Makes client code simpler if we don't allow
        allowed[msg.sender][_spender] = _amount;
        // TODO: emit event
        return true;
    }

    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    // This is only callable by the parent contract which emits transfer events
    function transferFrom(
            address _from,
            address _to,
            uint256 _amount
        ) public {
        transferFromWithNarrative(_from, _to, _amount, "");
    }

    function transferFromWithNarrative(
        address _from,
        address _to,
        uint256 _amount,
        string _narrative
    ) public {
        require(balances[_from] >= _amount);
        require(allowed[_from][msg.sender] >= _amount);
        require(_amount > 0);
        balances[_from] = balances[_from].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);
        e_transfer(_from, _to, _amount, _narrative, getFee(_amount));
    }

    event e_issued(uint amount);
    function issue(uint amount) public {
        // FIXME: owner only allowed for testing, remove from production
        require(msg.sender == owner || msg.sender == loanManagerAddress);
        totalSupply = totalSupply.add(amount);
        balances[this] = balances[this].add(amount);
        e_issued(amount);
    }

    event e_burned(uint amount);
    function burn(uint amount) public {
        require(msg.sender == owner || msg.sender == loanManagerAddress);
        require(amount <= balances[this]);
        totalSupply = totalSupply.sub(amount);
        balances[this] = balances[this].sub(amount);
        e_burned(amount);
    }

    // FIXME: this is only for testing, remove this function from production
    function withdrawTokens(address _to, uint _amount) external onlyOwner {
        require(_amount <= balances[this]);
        balances[this] = balances[this].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
    }

    function repayAndBurn(address borrower, uint repaidAmount, uint disbursedAmount, string narrative) external {
        require(msg.sender == loanManagerAddress);
        transferNoFee(borrower, address(this), repaidAmount, narrative);
        burn(repaidAmount);
        if(repaidAmount > disbursedAmount) {
            // transfer interestAmount to InterestEarnedAccount
            uint interestAmount = repaidAmount.sub(disbursedAmount);
            balances[interestEarnedAccount] = balances[interestEarnedAccount].add(interestAmount);
            balances[interestPoolAccount] = balances[interestPoolAccount].sub(interestAmount);
        }
    }

    function issueAndDisburse(address borrower, uint loanAmount, uint disbursedAmount, string narrative) external {
        require(msg.sender == loanManagerAddress);
        require(loanAmount > 0);
        if(loanAmount > disbursedAmount) {
            issue(loanAmount);
            // move interest to InterestPoolAccount
            uint interestAmount = loanAmount.sub(disbursedAmount);
            balances[interestPoolAccount] = balances[interestPoolAccount].add(interestAmount);
            balances[this] = balances[this].sub(interestAmount);
        } else {
            issue(disbursedAmount); // negative or zero interest loan
        }
        transferNoFee(address(this), borrower, disbursedAmount, narrative);
    }

}
