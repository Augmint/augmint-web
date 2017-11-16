/* UCD Token implementation (ERC20 token)
    This contract manages:
        * Balances of UCD holders and transactions between them
        * Issues and burns UCD
            - manually by the contract owner or
            - automatically when new UCD loan issued or repaid
        * Holds ETH reserve (as regular ETH balance of the contract)
            from defaulted loans
            TBD: ETH bought by owner for UCD
        * Holds UCD reserve (stored as regular UCD balance under the contract address)
            from ETH collateral sold on auctions (from defauleted loans)
            newly issued UCD (UCD reserve)

        Note that all reserves are held under the contract address,
          therefore any transaction on the reserve is limited to the tx-s defined here
          (ie. transfer of reserve is not possible by the contract owner)

    TODO: split this: ERC20 base - generic Augmint Token - ACD Token 
    TODO: separate data from logic?
    TODO: decision making mechanism (ie. replace all onlyOwner)
    TODO: remove test functions (getUcdFromReserve + restrict issueUcd)
    TODO: check more security best practices, eg: https://github.com/ConsenSys/smart-contract-best-practices,
                        https://github.com/OpenZeppelin/zeppelin-solidity
                        https://github.com/OpenZeppelin/zeppelin-solidity/tree/master/contracts/token
*/
pragma solidity ^0.4.18;
import "./Owned.sol";
import "./SafeMath.sol";

contract TokenUcd is owned {
    using SafeMath for uint256;

    uint256 public totalSupply; // total amount of tokens

    // Balances for each account
    mapping(address => uint256) balances;
    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) allowed;

    string public constant name = "Augmint Crypto Dollar";
    string public constant symbol = "ACD";
    uint8 public constant decimals = 4; // TODO: check if 4 enough - assuming rate will be around USD

    address public loanManagerAddress; // used for authorisation of issuing ACD for loans
    address public exchangeAddress; // for authorisation of transferExchange()

    function () public payable {} // to accept ETH sent into reserve (from defaulted loan's collateral )

    // What is the balance of a particular account?
    function balanceOf(address _owner) external view returns (uint256 balance) {
        return balances[_owner];
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

    event e_transfer(address indexed from, address indexed to, uint amount, string narrative);

    function transfer(address _to, uint256 _amount) external {
        transferWithNarrative(_to, _amount, "");
    }

    function transferWithNarrative(address _to, uint256 _amount, string narrative) public {
        require(msg.sender != _to); // no need to send to myself. Makes client code simpler if we don't allow
        require(balances[msg.sender] >= _amount);
        require(_amount > 0);
        balances[msg.sender] = balances[msg.sender].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
        e_transfer(msg.sender, _to, _amount, narrative);
    }

    function systemTransfer(address _from, address _to, uint256 _amount, string narrative) public {
        // Transfer the balance between any two accounts
        // Exchange and LoanManager contract  uses it at the moment for repay and exchange txs
        // TODO: check if exchange really needs it so that we could change to internal
        require( msg.sender == exchangeAddress || msg.sender == loanManagerAddress);
        require(_from != _to); // no need to send to myself. Makes client code simpler if we don't allow
        require( balances[_from] >= _amount);
        require(_amount > 0);
        balances[_from] = balances[_from].sub(_amount);
        balances[_to] = balances[_to].add(_amount);
        e_transfer(_from, _to, _amount, narrative);
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
        e_transfer(_from, _to, _amount, _narrative);
    }

    event e_ucdIssued(uint amount);
    function issueUcd(uint amount) public  { // FIXME: this is only public for testing, change to internal
        require(msg.sender == owner || msg.sender == loanManagerAddress); // this won't be needed when we change it internal
        totalSupply = totalSupply.add(amount);
        balances[this] = balances[this].add(amount);
        e_ucdIssued(amount);
    }

    event e_ucdBurned(uint amount);
    function burnUcd(uint amount) internal {
        require( amount <= balances[this]);
        totalSupply = totalSupply.sub(amount);
        balances[this] = balances[this].sub(amount);
        e_ucdBurned(amount);
    }

    function repayAndBurn(address borrower, uint loanAmount, uint disbursedAmount, string narrative) external {
        require(msg.sender == loanManagerAddress); // only called from repay()
        systemTransfer(borrower, address(this), loanAmount, narrative);
        if( loanAmount > disbursedAmount) {
            burnUcd(disbursedAmount); // we leave the interest in reserve
        } else  {
            burnUcd(loanAmount); // it was with zero or negative interest, we just burn the loanAmount
        }
    }

    // FIXME: this is only for testing, remove this function
    function getUcdFromReserve(uint amount) external onlyOwner {
        require(amount <= balances[this]);
        balances[this] = balances[this].sub(amount);
        balances[msg.sender] = balances[msg.sender].add(amount);
    }

    function issueAndDisburse(address borrower, uint loanAmount, uint disbursedAmount, string narrative) external {
        require( msg.sender == loanManagerAddress);
        require(loanAmount > 0);
        if( loanAmount > disbursedAmount) {
            issueUcd(loanAmount);
        } else {
            issueUcd(disbursedAmount); // negative or zero interest loan
        }
        systemTransfer(address(this), borrower, disbursedAmount, narrative);
        // we leave the interest part (if any) in reserve
    }

}
