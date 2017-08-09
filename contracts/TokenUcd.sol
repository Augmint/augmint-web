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

    TODO:
        - decision making mechanism (ie. replace all onlyOwner)
        - implement ETH selling (ie. separate auction contract)
        - consider moving reserve to a separate contract
        - use safe maths and/or use ds-math: https://blog.dapphub.com/ds-math/ or zeppelin safe math: https://github.com/OpenZeppelin/zeppelin-solidity
        - check more security best practices, eg: https://github.com/ConsenSys/smart-contract-best-practices
        - move ERR all error code constants to lib/separate contract
*/
pragma solidity ^0.4.11;
import "./Owned.sol";
import "./ERC20Impl.sol";

contract TokenUcd is ERC20Impl, owned {
    string public constant name = "US Crypto Dollar";
    string public constant symbol = "UCD";
    uint8 public constant decimals = 4; // TODO: check if 4 enough - assuming rate will be around USD

    int8 constant public SUCCESS = 1;
    int8 constant public ERR_RESERVE_BALANCE_NOT_ENOUGH = -1;
    int8 public constant ERR_UCD_BALANCE_NOT_ENOUGH = -2;
    int8 constant public ERR_NOT_AUTHORISED = -3;

    address public loanManagerAddress; // used for authorisation of issuing UCD for loans

    function () payable {} // to accept ETH sent into reserve (from defaulted loan's collateral )

    function getUcdReserveBalance() constant returns (uint balance) {
        return balances[this];
    }

    event e_loanManagerAddressChanged(address newAddress);
    function setLoanManagerAddress(address newAddress) onlyOwner returns(int8 result) {
        loanManagerAddress = newAddress;
        e_loanManagerAddressChanged(newAddress);
        return SUCCESS;
    }

    event e_ucdIssued(uint amount);
    function issueUcd(uint amount) onlyOwner returns (int8 result) {
        totalSupply += amount;
        balances[this] += amount;
        e_ucdIssued(amount);
        return SUCCESS;
    }

    event e_ucdBurned(uint amount);
    function burnUcd(uint amount) onlyOwner returns (int8 result) {
        if (amount > balances[this]) {
            return ERR_RESERVE_BALANCE_NOT_ENOUGH;
        }
        totalSupply -= amount;
        balances[this] -= amount;
        e_ucdBurned(amount);
        return SUCCESS;
    }

    function issueAndDisburseUcd(address borrower, uint ucdDueAtMaturity, uint disbursedLoanInUcd) returns (int8 result) {
        if( msg.sender != loanManagerAddress) {
            return ERR_NOT_AUTHORISED;
        }
        if( ucdDueAtMaturity > disbursedLoanInUcd) {
            totalSupply += ucdDueAtMaturity;
            balances[this] += ucdDueAtMaturity - disbursedLoanInUcd;
        } else {
            totalSupply += disbursedLoanInUcd;
        }

        balances[borrower] += disbursedLoanInUcd;
        return SUCCESS;
    }

    function repayAndBurnUcd(address borrower, uint ucdDueAtMaturity) returns (int8 result) {
        if( msg.sender != loanManagerAddress) {
            return ERR_NOT_AUTHORISED;
        }
        if( balances[borrower] < ucdDueAtMaturity) {
            return ERR_UCD_BALANCE_NOT_ENOUGH;
        }
        balances[borrower] -= ucdDueAtMaturity;
        totalSupply -= ucdDueAtMaturity;
        return SUCCESS;
    }

    // TODO: sell ETH (from reserve) for UCD and add to UCD reserve (do we need this?)
    // TODO: sell UCD (from reserve) for ETH and add to ETH reserve

}
