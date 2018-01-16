
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
// -> NewLock has totalAmountLocked which includes interest, but maybe it would be better to have amount
//      locked without interest?

pragma solidity 0.4.18;

import "./generic/Owned.sol";
import "./generic/SafeMath.sol";
import "./interfaces/AugmintTokenInterface.sol";


contract Locker is Owned {

    using SafeMath for uint256;

    event NewLockProduct(uint indexed lockProductId, uint perTermInterest, uint durationInSecs, bool isActive);
    event LockProductActiveChange(uint indexed lockProductId, bool newActiveState);
    // NB: totalAmountLocked includes the original amount, plus interested
    event NewLock(uint indexed lockId, address indexed lockOwner, uint totalAmountLocked, uint lockedUntil, 
                    uint perTermInterest, uint durationInSecs, bool isActive);
    event LockReleased(uint indexed lockId, address indexed lockOwner);

    struct LockProduct {
        // perTermInterest is in millionths (i.e. 1,000,000 = 100%):
        uint perTermInterest;
        uint durationInSecs;
        bool isActive;
    }

    struct Lock {
        uint amountLocked;
        uint lockedUntil;
        uint perTermInterest;
        uint durationInSecs;
        bool isActive;
    }

    AugmintTokenInterface public augmintToken;

    LockProduct[] public lockProducts;
    // per account locks:
    mapping(address => Lock[]) public locks;

    function Locker(address augmintTokenAddress) public {

        augmintToken = AugmintTokenInterface(augmintTokenAddress);

    }

    function addLockProduct(uint perTermInterest, uint durationInSecs, bool isActive) external onlyOwner {

        uint newLockProductId = lockProducts.push(LockProduct(perTermInterest, durationInSecs, isActive)) - 1;
        NewLockProduct(newLockProductId, perTermInterest, durationInSecs, isActive);

    }

    function setLockProductActiveState(uint lockProductId, bool isActive) external onlyOwner {

        require(lockProductId < lockProducts.length);
        lockProducts[lockProductId].isActive = isActive;
        LockProductActiveChange(lockProductId, isActive);

    }

    function getLockProductCount() external view returns (uint) {

        return lockProducts.length;

    }

    // returns 20 lock products starting from some offset
    // lock products are encoded as [ perTermInterest, durationInSecs, isActive ]
    function getLockProducts(uint offset) external view returns (uint[3][20]) {

        uint[3][20] memory response;

        for (uint8 i = 0; i < 20; i++) {

            if (offset + i >= lockProducts.length) { break; }

            LockProduct storage lockProduct = lockProducts[offset + i];

            response[offset + i] = [ lockProduct.perTermInterest, lockProduct.durationInSecs,
                lockProduct.isActive ? 1 : 0 ];

        }

        return response;

    }

    // the flow for locking tokens is:
    // 1) user calls token contract to lock tokens
    // 2) token contract calls calculateInterestForLockProduct to get interestEarned
    // 3) token contract transfers tokens from user and interestEarnedPool to Locker
    // 4) token contract calls createLock
    //
    // helper for lockable tokens
    function calculateInterestForLockProduct(uint lockProductId, uint amountToLock) external view returns (uint) {

        LockProduct storage lockProduct = lockProducts[lockProductId];
        require(lockProduct.isActive);

        uint interestEarned = amountToLock.mul(lockProduct.perTermInterest).div(1000000);

        return interestEarned;

    }

    // NB: totalAmountLocked includes both the lock amount AND the interest
    function createLock(uint lockProductId, address lockOwner, uint totalAmountLocked) external {

        // only the token can call this:
        require(msg.sender == address(augmintToken));

        LockProduct storage lockProduct = lockProducts[lockProductId];
        require(lockProduct.isActive);

        uint lockedUntil = now.add(lockProduct.durationInSecs);
        uint lockId = locks[lockOwner].push(Lock(totalAmountLocked, lockedUntil, lockProduct.perTermInterest, 
                                    lockProduct.durationInSecs, true)) - 1;

        NewLock(lockId, lockOwner, totalAmountLocked, lockedUntil, lockProduct.perTermInterest, 
                    lockProduct.durationInSecs, true);

    }

    function releaseFunds(address lockOwner, uint lockId) external {
        
        Lock storage lock = locks[lockOwner][lockId];
        
        require(lock.isActive && now >= lock.lockedUntil);
        
        lock.isActive = false;
        augmintToken.transferNoFee(lockOwner, lock.amountLocked, "Releasing funds from lock");
        
        LockReleased(lockId, lockOwner);
    }

    function getLockCountForAddress(address lockOwner) external view returns (uint) {

        return locks[lockOwner].length;

    }

    // returns 20 locks starting from some offset
    // lock products are encoded as [ amountLocked, lockedUntil, perTermInterest, durationInSecs, isActive ]
    // NB: perTermInterest is in millionths (i.e. 1,000,000 = 100%):
    function getLocksForAddress(address lockOwner, uint offset) external view returns (uint[5][20]) {

        Lock[] storage locksForAddress = locks[lockOwner];
        uint[5][20] memory response;

        for (uint8 i = 0; i < 20; i++) {

            if (offset + i >= locksForAddress.length) { break; }

            Lock storage lock = locksForAddress[offset + i];

            response[offset + i] = [ lock.amountLocked, lock.lockedUntil, lock.perTermInterest, 
                                        lock.durationInSecs, lock.isActive ? 1 : 0 ];

        }

        return response;

    }

}
