/* Augmint Token interface  */
pragma solidity ^0.4.18;
import "../generic/SafeMath.sol";


interface AugmintTokenInterface {
    using SafeMath for uint256;

    event e_systemAccountsChanged(address newFeeAccount, address newInteresPoolAccount,
        address newInterestEarnedAccount);

    event e_transferFeesChanged(uint _transferFeePt, uint _transferFeeMin, uint _transferFeeMax);

    event e_transfer(address indexed from, address indexed to, uint amount, string narrative, uint fee);

    event e_issued(uint amount);

    event e_burned(uint amount);

    function () public payable;// to accept ETH sent into reserve (from defaulted loan's collateral )
    // TODO: shall we put protection against accidentally sending in ETH?

    function transferWithNarrative(address _to, uint256 _amount, string _narrative) external;

    function transferNoFee(address _from, address _to, uint256 _amount, string _narrative)
        external;

    function transferFromWithNarrative(address _from, address _to, uint256 _amount, string _narrative) public;

    function transferFromNoFee(address _from, address _to, uint256 _amount, string _narrative) public;

    function issue(uint amount) external;

    function burn(uint amount) external;

}
