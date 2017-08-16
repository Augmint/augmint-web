/* ERC20 Implementaion */
pragma solidity ^0.4.11;
contract ERC20Impl {

    /*  This is a slight change to the ERC20 base standard.
        function totalSupply() constant returns (uint256 supply);
        is replaced with:
        uint256 public totalSupply;
        This automatically creates a getter function for the totalSupply.
        This is moved to the base contract since public getter functions are not
        currently recognised as an implementation of the matching abstract
        function by the compiler.
    */
    uint256 public totalSupply; // total amount of tokens

    // Balances for each account
    mapping(address => uint256) balances;
    // Owner of account approves the transfer of an amount to another account
    mapping(address => mapping (address => uint256)) allowed;

    // What is the balance of a particular account?
    function balanceOf(address _owner) constant returns (uint256 balance) {
        return balances[_owner];
    }

     // Transfer the balance from owner's account to another account
     // This is only callable by the parent contract which emits transfer events
    function _transfer(address _to, uint256 _amount) internal returns (bool success) {
        require(msg.sender != _to); // no need to send to myself. Makes client code simpler if we don't allow
        if (balances[msg.sender] >= _amount
            && _amount > 0
            && balances[_to] + _amount > balances[_to]) {
                balances[msg.sender] -= _amount;
                balances[_to] += _amount;
                return true;
        } else {
            return false;
        }
    }

    // Send _value amount of tokens from address _from to address _to
    // The transferFrom method is used for a withdraw workflow, allowing contracts to send
    // tokens on your behalf, for example to "deposit" to a contract address and/or to charge
    // fees in sub-currencies; the command should fail unless the _from account has
    // deliberately authorized the sender of the message via some mechanism; we propose
    // these standardized APIs for approval:
    // This is only callable by the parent contract which emits transfer events
    function _transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) internal returns (bool success) {
        if (balances[_from] >= _amount
            && allowed[_from][msg.sender] >= _amount
            && _amount > 0
            && balances[_to] + _amount > balances[_to]) {
                balances[_from] -= _amount;
                allowed[_from][msg.sender] -= _amount;
                balances[_to] += _amount;
                return true;
        } else {
            return false;
     }
    }

    // Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    // If this function is called again it overwrites the current allowance with _value.
    function approve(address _spender, uint256 _amount) returns (bool success) {
        require(msg.sender != _spender); // no need to approve for myself. Makes client code simpler if we don't allow
        allowed[msg.sender][_spender] = _amount;
        return true;
    }
}
