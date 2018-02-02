/* Generic Augmint Token implementation (ERC20 token)
    This contract manages:
        * Balances of Augmint holders and transactions between them
        * Issues and burns tokens when loan issued or repaid
        * Holds reserves:
            - ETH as regular ETH balance of the contract
            - ERC20 token reserve (stored as regular Token balance under the contract address)

        Note that all reserves are held under the contract address,
          therefore any transaction on the reserve is limited to the tx-s defined here
          (ie. transfer of reserve is not possible by the contract owner)
    TODO: ERC20 short address attack protection? https://github.com/DecentLabs/dcm-poc/issues/62
    TODO: create a LockerInterface and use that instead of Locker.sol ?
*/
pragma solidity 0.4.19;
import "../interfaces/AugmintTokenInterface.sol";
import "../interfaces/LoanManagerInterface.sol";
import "../interfaces/ExchangeInterface.sol";
import "../Locker.sol";


contract AugmintToken is AugmintTokenInterface {

    address public feeAccount;
    address public interestEarnedAccount;
    uint public transferFeePt; // in parts per million , ie. 2,000 = 0.2%
    uint public transferFeeMin; // with base unit of augmint token, eg. 4 decimals for token, eg. 31000 = 3.1 ACE
    uint public transferFeeMax; // with base unit of augmint token, eg. 4 decimals for token, eg. 31000 = 3.1 ACE

    uint public issuedByMonetaryBoard; // supply issued manually by monetary board

    event TransferFeesChanged(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax);

    function AugmintToken(string _name, string _symbol, bytes32 _peggedSymbol, uint8 _decimals, address _feeAccount,
        address _interestEarnedAccount, uint _transferFeePt, uint _transferFeeMin,
        uint _transferFeeMax) public {
        require(_feeAccount != address(0));
        require(_interestEarnedAccount != address(0));
        require(bytes(_name).length > 0);
        name = _name;
        symbol = _symbol;
        peggedSymbol = _peggedSymbol;
        decimals = _decimals;
        feeAccount = _feeAccount;
        interestEarnedAccount = _interestEarnedAccount;
        transferFeePt = _transferFeePt;
        transferFeeMin = _transferFeeMin;
        transferFeeMax = _transferFeeMax;
    }

    function () public payable { // solhint-disable-line no-empty-blocks
        // to accept ETH sent into reserve (from defaulted loan's collateral )
    }

    // Issue tokens to Reserve
    function issue(uint amount) external restrict("MonetaryBoard") {
        issuedByMonetaryBoard = issuedByMonetaryBoard.add(amount);
        _issue(this, amount);
    }

    // Burn tokens from Reserve
    function burn(uint amount) external restrict("MonetaryBoard") {
        issuedByMonetaryBoard = issuedByMonetaryBoard.sub(amount);
        _burn(this, amount);
    }

    function lockFunds(address lockerAddress, uint lockProductId, uint amountToLock) external {
        require(permissions[lockerAddress]["LockerContracts"]); // only whitelisted LockerContracts

        // NB: locker.createLock will validate lockProductId and amountToLock:
        Locker locker = Locker(lockerAddress);
        uint interestEarnedAmount = locker.createLock(lockProductId, msg.sender, amountToLock);

        _transfer(msg.sender, address(locker), amountToLock, "Locking funds", 0);
        _transfer(interestEarnedAccount, address(locker), interestEarnedAmount, "Accrue lock interest", 0);

    }

    function issueAndDisburse(address borrower, uint loanAmount, string narrative)
    external restrict("LoanManagerContracts") {
        require(loanAmount > 0);
        _issue(this, loanAmount);
        _transfer(this, borrower, loanAmount, narrative, 0);
    }

    /* Users must repay through AugmintToken.repayLoan()*/
    function repayLoan(address _loanManager, uint loanId) external {
        require(permissions[_loanManager]["LoanManagerContracts"]); // only whitelisted loanManagers
        LoanManagerInterface loanManager = LoanManagerInterface(_loanManager);
        // solhint-disable-next-line space-after-comma
        var (borrower, , , repaymentAmount , loanAmount, interestAmount, ) = loanManager.loans(loanId);
        require(borrower == msg.sender);
        _transfer(msg.sender, this, repaymentAmount, "Loan repayment", 0);
        _burn(this, loanAmount);
        if (interestAmount > 0) {
            // transfer interestAmount to InterestEarnedAccount (internal transfer, no need for Transfer events)
            balances[this] = balances[this].sub(interestAmount);
            balances[interestEarnedAccount] = balances[interestEarnedAccount].add(interestAmount);
        }
        loanManager.releaseCollateral(loanId);
    }

    /* convenience function - alternative to Exchange.placeSellTokenOrder without approval required */
    function placeSellTokenOrderOnExchange(address _exchange, uint price, uint tokenAmount)
    external returns (uint sellTokenOrderIndex, uint sellTokenOrderId) {
        require(permissions[_exchange]["ExchangeContracts"]); // only whitelisted exchanges
        ExchangeInterface exchange = ExchangeInterface(_exchange);
        _transfer(msg.sender, _exchange, tokenAmount, "Sell token order placed", 0);
        return exchange.placeSellTokenOrderTrusted(msg.sender, price, tokenAmount);
    }

    function transferWithNarrative(address _to, uint256 _amount, string _narrative) external {
        _transfer(msg.sender, _to, _amount, _narrative, getFee(_amount));
    }

    function transferNoFee(address _to, uint256 _amount, string _narrative)
    external restrict("NoFeeTransferContracts") {
        _transfer(msg.sender, _to, _amount, _narrative, 0);
    }

    function setTransferFees(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax)
    external restrict("MonetaryBoard") {
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
        require(_spender != 0x0);
        require(msg.sender != _spender); // no need to approve for myself. Makes client code simpler if we don't allow
        allowed[msg.sender][_spender] = _amount;
        Approval(msg.sender, _spender, _amount);
        return true;
    }

    /**
     ERC20 transferFrom attack protection: https://github.com/DecentLabs/dcm-poc/issues/57
     approve should be called when allowed[_spender] == 0. To increment allowed value is better
     to use this function to avoid 2 calls (and wait until the first transaction is mined)
     Based on MonolithDAO Token.sol */
    function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
        return _increaseApproval(msg.sender, _spender, _addedValue);
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
    public restrict("NoFeeTransferContracts") {
        _transferFrom(_from, _to, _amount, _narrative, 0);
    }

    function _increaseApproval(address _approver, address _spender, uint _addedValue) internal returns (bool) {
        require(_approver != _spender); // no need to approve for myself. Makes client code simpler if we don't allow
        allowed[_approver][_spender] = allowed[_approver][_spender].add(_addedValue);
        Approval(_approver, _spender, allowed[_approver][_spender]);
    }

    function getFee(uint amount) internal view returns (uint256 fee) {
        if (amount > 0) {
            fee = amount.mul(transferFeePt).div(1000000);
        } else {
            fee = 0;
        }
        if (fee > transferFeeMax) {
            fee = transferFeeMax;
        } else if (fee < transferFeeMin) {
            fee = transferFeeMin;
        }
        return fee;
    }

    function _transferFrom(address _from, address _to, uint256 _amount, string _narrative, uint _fee) private {
        require(balances[_from] >= _amount);
        require(allowed[_from][msg.sender] >= _amount);
        require(allowed[_from][msg.sender] > 0); // don't allow 0 transferFrom if no approval

        /* NB: fee is deducted from owner. It can result that transferFrom of amount x to fail
                when x + fee is not availale on owner balance */
        _transfer(_from, _to, _amount, _narrative, _fee);

        allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);
    }

    function _transfer(address _from, address _to, uint256 _amount, string narrative, uint _fee) private {
        require(_to != 0x0);
        require(_from != _to); // no need to send to myself. Makes client code simpler if we don't allow
        if (_fee > 0) {
            balances[feeAccount] = balances[feeAccount].add(_fee);
            balances[_from] = balances[_from].sub(_amount).sub(_fee);
        } else {
            balances[_from] = balances[_from].sub(_amount);
        }
        balances[_to] = balances[_to].add(_amount);
        Transfer(_from, _to, _amount);
        AugmintTransfer(_from, _to, _amount, narrative, _fee);
    }

    function _burn(address from, uint amount) private {
        balances[from] = balances[from].sub(amount);
        totalSupply = totalSupply.sub(amount);
        Transfer(from, 0x0, amount);
    }

    function _issue(address to, uint amount) private {
        balances[to] = balances[to].add(amount);
        totalSupply = totalSupply.add(amount);
        Transfer(0x0, to, amount);
    }
}
