/* Generic contract to authorise calls to certain functions only from a given address.
    This is just for single adderss authorisation.
*/

pragma solidity ^0.4.18;

import "./Owned.sol";

contract Restricted is Owned {
    /* TODO: replace Owned with multisig permission */     
    // NB: using bytes32 rather than the string type because it's cheaper gas-wise:
    mapping (address => mapping (bytes32 => bool)) permissions;

    event EPermissionGranted(address indexed agent, bytes32 grantedPermission);
    event EPermissionRevoked(address indexed agent, bytes32 revokedPermission);

    modifier restrict(bytes32 requiredPermission) {
        require(permissions[msg.sender][requiredPermission]);
        _;
    }

    function grantPermission(address agent, bytes32 requiredPermission) public onlyOwner {
        permissions[agent][requiredPermission] = true;
    }

    function revokePermission(address agent, bytes32 requiredPermission) public onlyOwner {
        permissions[agent][requiredPermission] = false;
    }

}
