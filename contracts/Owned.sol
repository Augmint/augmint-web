// TODO: remove - use generic/owned.sol
pragma solidity ^0.4.18;

contract owned {
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function owned() public {
        owner = msg.sender;
    }

    event NewOwner(address indexed old, address indexed current);
    function setOwner(address _new) external onlyOwner {
      NewOwner(owner, _new);
      owner = _new;
    }

}
