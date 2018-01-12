
// contract for tracking locked funds etc.

// requirements
// -> lock funds
// -> unlock funds
// -> index locks by address

// to do/think about:
// -> self-destruct function?
// -> return only active loan products from getLoanProducts?
// -> add events
// -> need to update token contract? probably not? a new token contract would imply a fresh deployment?
// -> test locking small (<10) amounts - need a min lock amount in lockProducts

pragma solidity ^0.4.18;

import "./generic/Owned.sol";
import "./generic/SafeMath.sol";

contract Locker is Owned {

    using SafeMath for uint256;

    struct LockProduct {
        // perAnnumInterest is in millionths (i.e. 1,000,000 = 100%):
        uint perAnnumInterest;
        uint durationInSecs;
        bool isActive;
    }

    struct Lock {
        uint amountLocked;
        uint lockedUntil;
        bool isActive;
    }

    address public tokenAddress;

    LockProduct[] public lockProducts;
    // per account locks:
    mapping(address => Lock[]) public locks;

    function Locker(address _tokenAddress) public {

        tokenAddress = _tokenAddress;
        
    }

    function addLockProduct(uint perAnnumInterest, uint durationInSecs, bool isActive) public onlyOwner {

        lockProducts.push(LockProduct(perAnnumInterest, durationInSecs, isActive));

    }

    function setLockProductActiveState(uint productIndex, bool isActive) public onlyOwner {

        require(productIndex < lockProducts.length);
        lockProducts[productIndex].isActive = isActive;

    }

    function getLockProductCount() public view returns (uint) {

        return lockProducts.length;

    }

    // returns 20 lock products starting from some offset
    // lock products are encoded as [ perAnnumInterest, durationInSecs, isActive ]
    function getLockProducts(uint offset) public view returns (uint[3][20]) {

        uint[3][20] memory response;

        for (uint8 i = 0; i < 20; i++) {

            if (offset + i >= lockProducts.length) { break; }

            LockProduct storage lockProduct = lockProducts[offset + i];

            response[offset + i] = [ lockProduct.perAnnumInterest, lockProduct.durationInSecs, lockProduct.isActive ? 1 : 0 ];

        }

        return response;

    }

    // the flow for locking tokens is:
    // 1) user calls token contract to lock tokens
    // 2) token contract calls calculateInterestForLockProduct to get interestEarned
    // 3) token contract transfers tokens from user and interestEarnedPool to Locker
    // 4) token contract calls createLock

    // helper for lockable tokens
    function calculateInterestForLockProduct(uint lockProductId, uint amountToLock) external view returns (uint) {

        LockProduct storage lockProduct = lockProducts[lockProductId];
        require(lockProduct.isActive);

        // TODO: take care of per annum issue:
        uint interestEarned = amountToLock.mul(lockProduct.perAnnumInterest).div(1000000);

        return interestEarned;

    }

    // NB: totalAmountLocked includes both the lock amount AND the interest
    function createLock(uint lockProductId, address lockOwner, uint totalAmountLocked) external {

        // only the token can call this:
        require(msg.sender == tokenAddress);

        LockProduct storage lockProduct = lockProducts[lockProductId];
        require(lockProduct.isActive);

        locks[lockOwner].push(Lock(totalAmountLocked, now.add(lockProduct.durationInSecs), true));

    }

    // the flow for unlocking tokens is:
    // 1) user calls token contract to unlock tokens
    // 2) token contract calls isUnlockable
    // 3) token contract transfers tokens from Locker to user
    // 4) token contract calls disableLock

    // returns the amount stored in a lock, but throws if that lock can't be unlocked yet:
    function getLockedAmountIfUnlockable(address lockOwner, uint lockIndex) external view returns (uint) {

        Lock storage lock = locks[lockOwner][lockIndex];
        require(lock.isActive && now >= lock.lockedUntil);

        return lock.amountLocked;

    }

    function disableLock(address lockOwner, uint lockIndex) external {

        // only the token can call this:
        require(msg.sender == tokenAddress);

        Lock storage lock = locks[lockOwner][lockIndex];
        require(lock.isActive && now >= lock.lockedUntil);

        lock.isActive = false;

    }

    function getLockCountForAddress(address lockOwner) public view returns (uint) {

        return locks[lockOwner].length;

    }

    // returns 20 locks starting from some offset
    // lock products are encoded as [ amountLocked, lockedUntil, isActive ]
    function getLocksForAddress(address lockOwner, uint offset) public view returns (uint[3][20]) {

        Lock[] storage locksForAddress = locks[lockOwner];
        uint[3][20] memory response;

        for (uint8 i = 0; i < 20; i++) {

            if (offset + i >= locksForAddress.length) { break; }

            Lock storage lock = locksForAddress[offset + i];

            response[offset + i] = [ lock.amountLocked, lock.lockedUntil, lock.isActive ? 1 : 0 ];

        }

        return response;

    }

}
