
// contract for tracking locked funds etc.

// requirements
// -> lock funds
// -> unlock funds
// -> index locks by address

// to do/think about:
// -> self-destruct function?
// -> return only active loan products from getLoanProducts?
// -> need to update token contract? probably not? a new token contract would imply a fresh deployment?
// -> test locking small (<10) amounts - need a min lock amount in lockProducts

pragma solidity 0.4.19;

import "./generic/Restricted.sol";
import "./generic/SafeMath.sol";
import "./interfaces/AugmintTokenInterface.sol";


contract Locker is Restricted {

    using SafeMath for uint256;

    event NewLockProduct(uint indexed lockProductId, uint perTermInterest, uint durationInSecs,
                            uint minimumLockAmount, bool isActive);

    event LockProductActiveChange(uint indexed lockProductId, bool newActiveState);

    // NB: amountLocked includes the original amount, plus interest
    event NewLock(address indexed lockOwner, uint indexed lockIndex, uint amountLocked, uint interestEarned,
                    uint lockedUntil, uint perTermInterest, uint durationInSecs, bool isActive);

    event LockReleased(address indexed lockOwner, uint indexed lockIndex);

    struct LockProduct {
        // perTermInterest is in millionths (i.e. 1,000,000 = 100%):
        uint perTermInterest;
        uint durationInSecs;
        uint minimumLockAmount;
        bool isActive;
    }

    struct Lock {
        uint amountLocked;
        uint interestEarned;
        uint lockedUntil;
        uint perTermInterest;
        uint durationInSecs;
        bool isActive;
    }

    AugmintTokenInterface public augmintToken;

    LockProduct[] public lockProducts;
    // per account locks (i.e. an id for a lock is a tuple (owner, index)):
    mapping(address => Lock[]) public locks;

    function Locker(address augmintTokenAddress) public {

        augmintToken = AugmintTokenInterface(augmintTokenAddress);

    }

    function addLockProduct(uint perTermInterest, uint durationInSecs, uint minimumLockAmount, bool isActive)
    external restrict("MonetaryBoard") {

        uint newLockProductId = lockProducts.push(
                                    LockProduct(perTermInterest, durationInSecs, minimumLockAmount, isActive)) - 1;
        NewLockProduct(newLockProductId, perTermInterest, durationInSecs, minimumLockAmount, isActive);

    }

    function setLockProductActiveState(uint lockProductId, bool isActive) external restrict("MonetaryBoard") {

        require(lockProductId < lockProducts.length);
        lockProducts[lockProductId].isActive = isActive;
        LockProductActiveChange(lockProductId, isActive);

    }

    function getLockProductCount() external view returns (uint) {

        return lockProducts.length;

    }

    // returns 20 lock products starting from some offset
    // lock products are encoded as [ perTermInterest, durationInSecs, minimumLockAmount, isActive ]
    function getLockProducts(uint offset) external view returns (uint[4][20]) {

        uint[4][20] memory response;

        for (uint8 i = 0; i < 20; i++) {

            if (offset + i >= lockProducts.length) { break; }

            LockProduct storage lockProduct = lockProducts[offset + i];

            response[i] = [ lockProduct.perTermInterest, lockProduct.durationInSecs,
                                        lockProduct.minimumLockAmount, lockProduct.isActive ? 1 : 0 ];

        }

        return response;

    }

    // the flow for locking tokens is:
    // 1) user calls token contract to lock tokens
    // 2) token contract calls createLock, which creates the locks and returns the interestEarned
    // 3) token contract transfers tokens from user and interestEarnedPool to Locker
    function calculateInterestForLockProduct(uint lockProductId, uint amountToLock) public view returns (uint) {

        LockProduct storage lockProduct = lockProducts[lockProductId];
        require(lockProduct.isActive);
        require(amountToLock >= lockProduct.minimumLockAmount);

        uint interestEarned = amountToLock.mul(lockProduct.perTermInterest).div(1000000);

        return interestEarned;

    }

    // NB: totalAmountLocked includes both the lock amount AND the interest
    function createLock(uint lockProductId, address lockOwner, uint amountToLock) external returns (uint) {

        // only the token can call this:
        require(msg.sender == address(augmintToken));

        // NB: calculateInterestForLockProduct will validate the lock product and amountToLock:
        uint interestEarned = calculateInterestForLockProduct(lockProductId, amountToLock);

        LockProduct storage lockProduct = lockProducts[lockProductId];

        uint lockedUntil = now.add(lockProduct.durationInSecs);
        uint lockIndex = locks[lockOwner].push(Lock(amountToLock, interestEarned, lockedUntil,
                                                    lockProduct.perTermInterest, lockProduct.durationInSecs, true)) - 1;

        NewLock(lockOwner, lockIndex, amountToLock, interestEarned, lockedUntil, lockProduct.perTermInterest,
                    lockProduct.durationInSecs, true);

        return interestEarned;

    }

    function releaseFunds(address lockOwner, uint lockIndex) external {

        Lock storage lock = locks[lockOwner][lockIndex];

        require(lock.isActive && now >= lock.lockedUntil);

        lock.isActive = false;
        augmintToken.transferNoFee(lockOwner, lock.amountLocked.add(lock.interestEarned), "Releasing funds from lock");

        LockReleased(lockOwner, lockIndex);
    }

    function getLockCountForAddress(address lockOwner) external view returns (uint) {

        return locks[lockOwner].length;

    }

    // returns 20 locks starting from some offset
    // lock products are encoded as
    //              [amountLocked, interestEarned, lockedUntil, perTermInterest, durationInSecs, isActive ]
    // NB: perTermInterest is in millionths (i.e. 1,000,000 = 100%):
    function getLocksForAddress(address lockOwner, uint offset) external view returns (uint[6][20]) {

        Lock[] storage locksForAddress = locks[lockOwner];
        uint[6][20] memory response;

        for (uint8 i = 0; i < 20; i++) {

            if (offset + i >= locksForAddress.length) { break; }

            Lock storage lock = locksForAddress[offset + i];

            response[i] = [ lock.amountLocked, lock.interestEarned, lock.lockedUntil, lock.perTermInterest,
                                        lock.durationInSecs, lock.isActive ? 1 : 0 ];

        }

        return response;

    }

}
