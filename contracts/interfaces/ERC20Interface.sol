pragma solidity ^0.4.18;


/*
 * ERC20 interface
 * see https://github.com/ethereum/EIPs/issues/20
 */
interface ERC20Interface {
    /* TODO: function allowance(address owner, address spender) public view returns (uint); */
    function transferFrom(address from, address to, uint value) public;
    function approve(address spender, uint value) public;
    function balanceOf(address who) public view returns (uint);
    function transfer(address to, uint value) public;

}
