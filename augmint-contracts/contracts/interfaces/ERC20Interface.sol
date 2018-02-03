/*
 * ERC20 interface
 * see https://github.com/ethereum/EIPs/issues/20
 */
pragma solidity 0.4.19;


interface ERC20Interface {
    event Approval(address indexed _owner, address indexed _spender, uint _value);
    event Transfer(address indexed from, address indexed to, uint amount);

    function allowance(address _owner, address _spender) public view returns (uint remaining);
    function transferFrom(address from, address to, uint value) public returns (bool);
    function approve(address spender, uint value) public returns (bool);
    function balanceOf(address who) public view returns (uint);
    function transfer(address to, uint value) public returns (bool); // solhint-disable-line no-simple-event-func-name

}
