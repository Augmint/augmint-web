/*
 * ERC20 interface
 * see https://github.com/ethereum/EIPs/issues/20
 */
pragma solidity ^0.4.18;


interface ERC20Interface {
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
    /* TODO: check how overloading events works w/ web3:
    event Transfer(address indexed from, address indexed to, uint amount); */

    function allowance(address _owner, address _spender) public view returns (uint256 remaining);
    function transferFrom(address from, address to, uint value) public;
    function approve(address spender, uint value) public;
    function balanceOf(address who) public view returns (uint);
    function transfer(address to, uint value) public;

}
