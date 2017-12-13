/* Augmint Token interface  */
pragma solidity ^0.4.18;
import "../generic/SafeMath.sol";
import "../generic/Restricted.sol";
import "./ERC20Interface.sol";


contract AugmintTokenInterface is Restricted, ERC20Interface {
    using SafeMath for uint256;

    event e_systemAccountsChanged(address newFeeAccount, address newInteresPoolAccount,
        address newInterestEarnedAccount);

    event e_transferFeesChanged(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax);

    event e_transfer(address indexed from, address indexed to, uint amount, string narrative, uint fee);

    event e_issued(uint amount);

    event e_burned(uint amount);
    /* TODO: function allowance(address owner, address spender) public view returns (uint); */
    function transferFrom(address from, address to, uint value) public;
    function approve(address spender, uint value) public;
    function balanceOf(address who) public view returns (uint);
    function transfer(address to, uint value) public;

    function () public payable;// to accept ETH sent into reserve (from defaulted loan's collateral )
    // TODO: shall we put protection against accidentally sending in ETH?

    function transferWithNarrative(address _to, uint256 _amount, string _narrative) external;

    function transferNoFee(address _from, address _to, uint256 _amount, string _narrative)
        external restrict("transferNoFee");

    function transferFromWithNarrative(address _from, address _to, uint256 _amount, string _narrative) public;

  /* TODO:  function transferFromNoFee(address _from, address _to, uint256 _amount, string _narrative)
        public restrict("transferFromNoFee"); */

    function issue(uint amount) external restrict("issue");

    function burn(uint amount) external restrict("burn");

}
