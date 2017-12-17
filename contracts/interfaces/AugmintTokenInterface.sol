/* Augmint Token interface

TODO: overload transfer() & transferFrom() instead of transferWithNarrative() & transferFromWithNarrative()
      when this fix available in web3 and truffle also uses that web3:
      https://github.com/ethereum/web3.js/pull/1185
TODO: decide on external vs. public and sync it with AugmintToken (and ERC20?)
TODO:L move totalSupply and maybe other declarations here
 */
pragma solidity ^0.4.18;
import "../generic/SafeMath.sol";
import "../generic/Restricted.sol";
import "./ERC20Interface.sol";


contract AugmintTokenInterface is Restricted, ERC20Interface {
    using SafeMath for uint256;

    function () public payable;// to accept ETH sent into reserve (from defaulted loan's collateral )
    /* TODO: shall we put protection against accidentally sending in ETH? */

    event SystemAccountsChanged(address newFeeAccount, address newInteresPoolAccount,
        address newInterestEarnedAccount);

    event TransferFeesChanged(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax);
    /* TODO: check how overloading events works w/ web3:
    event Transfer(address indexed from, address indexed to, uint amount); */
    event Transfer(address indexed from, address indexed to, uint amount, string narrative, uint fee);
    event TokenIssued(uint amount);
    event TokenBurned(uint amount);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);

    function transferWithNarrative(address _to, uint256 _amount, string _narrative) external;

    function transferNoFee(address _from, address _to, uint256 _amount, string _narrative)
    external restrict("transferNoFee");

    function issue(uint amount) external restrict("issue");
    function burn(uint amount) external restrict("burn");

    function newLoan(address borrower, uint loanAmount, uint interestAmount, string narrative)
        external restrict("newLoan");

    function allowance(address _owner, address _spender) public view returns (uint256 remaining);
    function transferFrom(address from, address to, uint value) public;
    function approve(address spender, uint value) public;
    function increaseApproval(address _spender, uint _addedValue) public returns (bool);
    function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool);

    function balanceOf(address who) public view returns (uint);
    function transfer(address to, uint value) public; // solhint-disable-line no-simple-event-func-name

    function transferFromNoFee(address _from, address _to, uint256 _amount, string _narrative)
        public restrict("transferFromNoFee");

    function transferFromWithNarrative(address _from, address _to, uint256 _amount, string _narrative) public;

}
