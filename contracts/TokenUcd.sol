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

    TODO: decision making mechanism (ie. replace all onlyOwner)
    TODO: implement ETH/UCD transfer for sale (ie. transfer from UCD or ETH reserves to exchange by owner)
    TODO: consider moving reserve to a separate contract
    TODO: add reentrancy protection
    TODO: remove test functions (issue/burnUcd, getUcdFromReserve)
    TODO: check more security best practices, eg: https://github.com/ConsenSys/smart-contract-best-practices, https://github.com/OpenZeppelin/zeppelin-solidity
    TODO: move ERR all error code constants to lib/separate contract
    TODO: any point for ECR20Impl and TokenUcd separation now?
*/
pragma solidity ^0.4.18;
import "./Owned.sol";
import "./SafeMath.sol";
import "./ERC20Impl.sol";

contract TokenUcd is ERC20Impl, owned {
    using SafeMath for uint256;
    string public constant name = "US Crypto Dollar";
    string public constant symbol = "UCD";
    uint8 public constant decimals = 4; // TODO: check if 4 enough - assuming rate will be around USD

    int8 constant public SUCCESS = 1;
    int8 constant public ERR_RESERVE_BALANCE_NOT_ENOUGH = -1;
    int8 public constant ERR_UCD_BALANCE_NOT_ENOUGH = -2;
    int8 constant public ERR_NOT_AUTHORISED = -3;

    address public loanManagerAddress; // used for authorisation of issuing UCD for loans
    address public exchangeAddress; // for authorisation of transferExchange()

    function () public payable {} // to accept ETH sent into reserve (from defaulted loan's collateral )

    function getUcdReserveBalance() external view returns (uint balance) {
        return balances[this];
    }

    event e_loanManagerAddressChanged(address newAddress);
    function setLoanManagerAddress(address newAddress) external onlyOwner returns(int8 result) {
        loanManagerAddress = newAddress;
        e_loanManagerAddressChanged(newAddress);
        return SUCCESS;
    }

    event e_exchangeAddressChanged(address newAddress);
    function setExchangeAddress(address newAddress) external onlyOwner returns(int8 result) {
        exchangeAddress = newAddress;
        e_exchangeAddressChanged(newAddress);
        return SUCCESS;
    }

    event e_transfer(address indexed from, address indexed to, uint amount, string narrative);
    function transferFrom(
        address _from,
        address _to,
        uint256 _amount
    ) external returns (bool success) {
        if (_transferFrom(_from, _to, _amount)) {
            e_transfer(_from, _to, _amount, "");
            return true;
        } else {
            return false;
        }
    }

    function transfer(address _to, uint256 _amount) external returns (bool success) {
        return transferWithNarrative(_to, _amount, "");
    }

    function transferWithNarrative(address _to, uint256 _amount, string narrative) public returns (bool success) {
        if ( _transfer(_to, _amount) ) {
            e_transfer(msg.sender, _to, _amount, narrative);
            return true;
        } else {
            return false;
        }
    }

    function systemTransfer(address _from, address _to, uint256 _amount, string narrative) public returns (bool success) {
        require( msg.sender == exchangeAddress || msg.sender == loanManagerAddress);
        if(_from == _to) { // we don't need to throw in case of transfer b/w own accounts
            return false;
        }
        if ( _transferInternal(_from, _to, _amount) ) {
            e_transfer(_from, _to, _amount, narrative);
            return true;
            } else {
                return false;
        }
    }

    // FIXME: this is only for testing, remove this function
    event e_ucdIssued(uint amount);
    function issueUcd(uint amount) external onlyOwner returns (int8 result) {
        totalSupply = totalSupply.add(amount);
        balances[this] = balances[this].add(amount);
        e_ucdIssued(amount);
        return SUCCESS;
    }

    // FIXME: this is only for testing, remove this function
    event e_ucdBurned(uint amount);
    function burnUcd(uint amount) external onlyOwner returns (int8 result) {
        if (amount > balances[this]) {
            return ERR_RESERVE_BALANCE_NOT_ENOUGH;
        }
        totalSupply = totalSupply.sub(amount);
        balances[this] = balances[this].sub(amount);
        e_ucdBurned(amount);
        return SUCCESS;
    }

    // FIXME: this is only for testing, remove this function
    function getUcdFromReserve(uint amount) external onlyOwner returns (int8 result) {
        if (amount > balances[this]) {
            return ERR_RESERVE_BALANCE_NOT_ENOUGH;
        }
        balances[this] = balances[this].sub(amount);
        balances[msg.sender] = balances[msg.sender].add(amount);
        return SUCCESS;
    }

    function issueAndDisburseUcd(address borrower, uint ucdDueAtMaturity, uint disbursedLoanInUcd, string narrative) external returns (int8 result) {
        if( msg.sender != loanManagerAddress) {
            return ERR_NOT_AUTHORISED;
        }
        if( ucdDueAtMaturity > disbursedLoanInUcd) {
            totalSupply = totalSupply.add(ucdDueAtMaturity);
            balances[this] = balances[this].add(ucdDueAtMaturity);
            // TODO: move interest (ucdDueAtMaturity.minus(disbursedLoanInUcd)) to interest pool
        } else {
            totalSupply = totalSupply.add(disbursedLoanInUcd);
            balances[this] = balances[this].add(disbursedLoanInUcd);
        }
        require( systemTransfer(this, borrower, disbursedLoanInUcd, narrative));
        return SUCCESS;
    }

    function repayAndBurnUcd(address borrower, uint ucdDueAtMaturity, string narrative) external returns (int8 result) {
        if( msg.sender != loanManagerAddress) {
            return ERR_NOT_AUTHORISED;
        }
        if( balances[borrower] < ucdDueAtMaturity) {
            return ERR_UCD_BALANCE_NOT_ENOUGH;
        }
        require( systemTransfer(borrower, this, ucdDueAtMaturity, narrative));
        totalSupply = totalSupply.sub(ucdDueAtMaturity);
        return SUCCESS;
    }

    // TODO: sell ETH (from reserve) for UCD and add to UCD reserve (do we need this?)
    // TODO: sell UCD (from reserve) for ETH and add to ETH reserve

}
