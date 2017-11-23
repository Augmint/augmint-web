
pragma solidity ^0.4.18;

contract Owned {
    
    address public owner;

    event NewOwner(address indexed oldOwner, address indexed newOwner);

    function Owned() public {
        // TODO: is this needed:
        require(owner == address(0x0));
        owner = msg.sender;
    }

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0x0));
        NewOwner(owner, newOwner);
        owner = newOwner;
    }

}
