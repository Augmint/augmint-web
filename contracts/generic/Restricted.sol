/*
    Generic contract to authorise calls to certain functions only from a given address.
    This is just for single adderss authorisation.

    TODO: replace Owned with multisig permission
*/

pragma solidity 0.4.19;
import "./Owned.sol";


contract Restricted is Owned {

    // NB: using bytes32 rather than the string type because it's cheaper gas-wise:
    mapping (address => mapping (bytes32 => bool)) public permissions;

    event PermissionGranted(address indexed agent, bytes32 grantedPermission);
    event PermissionRevoked(address indexed agent, bytes32 revokedPermission);

    modifier restrict(bytes32 requiredPermission) {
        require(permissions[msg.sender][requiredPermission]);
        _;
    }

    function grantPermission(address agent, bytes32 requiredPermission) public onlyOwner {
        permissions[agent][requiredPermission] = true;
        PermissionGranted(agent, requiredPermission);
    }

    function grantMultiplePermissions(address agent, bytes32[] requiredPermissions) public onlyOwner {
        uint256 length = requiredPermissions.length;
        for (uint256 i = 0; i < length; i++) {
            grantPermission(agent, requiredPermissions[i]);
        }
    }

    function revokePermission(address agent, bytes32 requiredPermission) public onlyOwner {
        permissions[agent][requiredPermission] = false;
        PermissionRevoked(agent, requiredPermission);
    }

    function revokeMulitplePermissions(address agent, bytes32[] requiredPermissions) public onlyOwner {
        uint256 length = requiredPermissions.length;
        for (uint256 i = 0; i < length; i++) {
            revokePermission(agent, requiredPermissions[i]);
        }
    }

}
