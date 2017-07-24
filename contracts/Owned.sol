pragma solidity ^0.4.11;

contract owned {
    address public owner;

    modifier onlyOwner() {
        if (msg.sender == owner) {
            _;
        }
    }

    function owned() {
        owner = msg.sender;
    }

    event NewOwner(address indexed old, address indexed current);
    function setOwner(address _new) onlyOwner {
      NewOwner(owner, _new);
      owner = _new;
    }

}
