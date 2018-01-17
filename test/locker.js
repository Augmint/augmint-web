"use strict";

const Locker = artifacts.require("Locker");

const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const testHelpers = require("./helpers/testHelper.js");

let tokenHolder = "";
let interestEarnedAddress = "";
let lockerInstance = null;
let tokenAceInstance = null;

function getEvents(contractInstance, eventName) {

    return new Promise((resolve, reject) => {

        contractInstance[eventName]().get((err, res) => {

            if (err) { return reject(err); }

            resolve(res);

        });

    });

}

async function assertEvent(contractInstance, eventName, expectedArgs) {

    const events = await getEvents(contractInstance, eventName);
    assert(events.length === 1);
    const event = events[0];

    assert(event.event === eventName);

    const eventArgs = event.args;

    Object.keys(expectedArgs).forEach((argName) => {

        const value = typeof event.args[argName].toNumber === 'function' ? event.args[argName].toNumber() : event.args[argName];
        const expectedValue = expectedArgs[argName];
        assert(value === expectedValue, `Event ${eventName} has ${argName} with a value of ${value} but expected ${expectedValue}`);

    });

}

async function getBalances(tokenInstance, accounts) {

    const balances = {};

    await Promise.all(accounts.map(async (address) => {

        balances[address] = (await tokenInstance.balances(address)).toNumber();

    }));

    return balances;

}

contract("Lock", accounts => {
    before(async () => {
        const superUserAddress = accounts[0];
        tokenHolder = accounts[1];

        tokenAceInstance = await tokenAceTestHelper.newTokenAceMock(superUserAddress);
        lockerInstance = await Locker.new(tokenAceInstance.address);

        interestEarnedAddress = await tokenAceInstance.interestEarnedAccount();

        await tokenAceInstance.setLocker(lockerInstance.address);
        await tokenAceInstance.grantPermission(lockerInstance.address, "transferNoFee");

        await tokenAceInstance.issue(50000);
        await tokenAceInstance.withdrawTokens(tokenHolder, 25000);
        await tokenAceInstance.withdrawTokens(interestEarnedAddress, 25000);
    });

    it("should allow lock products to be created", async () => {

        // create lock product with 5% per term, and 60 sec lock time:
        await lockerInstance.addLockProduct(50000, 60, 100, true);

        await assertEvent(lockerInstance, 'NewLockProduct', {
            lockProductId: 0,
            perTermInterest: 50000,
            durationInSecs: 60,
            minimumLockAmount: 100,
            isActive: true
        });

    });

    it("should allow the number of lock products to be queried", async () => {
        const startingNumLocks = (await lockerInstance.getLockProductCount()).toNumber();

        // create lock product with 5% per term, and 120 sec lock time:
        await lockerInstance.addLockProduct(50000, 120, 0, true);

        const endNumLocks = (await lockerInstance.getLockProductCount()).toNumber();

        assert(startingNumLocks + 1 === endNumLocks);
    });

    it("should allow the getting of individual lock products", async () => {
        // create lock product with 8% per term, and 120 sec lock time:
        await lockerInstance.addLockProduct(80000, 120, 50, true);

        const numLocks = (await lockerInstance.getLockProductCount()).toNumber();

        const product = await lockerInstance.lockProducts(numLocks - 1);

        // each product should be a 4 element array
        assert.isArray(product);
        assert(product.length === 4);

        // the product should be [ perTermInterest, durationInSecs, minimumLockAmount, isActive ]:
        const [ perTermInterest, durationInSecs, minimumLockAmount, isActive ] = product;
        assert(perTermInterest.toNumber() === 80000);
        assert(durationInSecs.toNumber() === 120);
        assert(minimumLockAmount.toNumber() === 50);
        assert(isActive === true);
    });

    it("should allow the listing of lock products", async () => {
        // create lock product with 10% per term, and 120 sec lock time:
        await lockerInstance.addLockProduct(100000, 120, 75, true);

        const numLocks = (await lockerInstance.getLockProductCount()).toNumber();

        const products = await lockerInstance.getLockProducts(0);

        // getLockProducts should return a 20 element array:
        assert.isArray(products);
        assert(products.length === 20);

        const newestProduct = products[numLocks - 1];

        // each product should be a 4 element array
        assert.isArray(newestProduct);
        assert(newestProduct.length === 4);

        // the products should be [ perTermInterest, durationInSecs, isActive ] all
        // represented as uints (i.e. BigNumber objects in JS land):
        const [ perTermInterest, durationInSecs, minimumLockAmount, isActive ] = newestProduct;
        assert(perTermInterest.toNumber() === 100000);
        assert(durationInSecs.toNumber() === 120);
        assert(minimumLockAmount.toNumber() === 75);
        assert(isActive.toNumber() === 1);
    });

    it("should allow lock products to be enabled/disabled", async () => {

        const lockProductId = 0;
        
        await lockerInstance.setLockProductActiveState(lockProductId, false);

        await assertEvent(lockerInstance, 'LockProductActiveChange', {
            lockProductId: lockProductId,
            newActiveState: false
        });

        let product = await lockerInstance.lockProducts(lockProductId);

        assert(product[3] === false);

        await lockerInstance.setLockProductActiveState(lockProductId, true);

        await assertEvent(lockerInstance, 'LockProductActiveChange', {
            lockProductId: lockProductId,
            newActiveState: true
        });

        product = await lockerInstance.lockProducts(lockProductId);

        assert(product[3] === true);

    });

    it("should allow tokens to be locked", async () => {

        const startingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);
        const amountToLock = 1000;

        // lock funds, and get the product that was used:
        const [ product ] = await Promise.all([ lockerInstance.lockProducts(0), 
                                                tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder }) ]);

        const perTermInterest = product[0];
        const interestEarned = Math.floor(amountToLock * perTermInterest / 1000000);

        // TODO: get values for commented out properties, and test for them:
        await assertEvent(lockerInstance, 'NewLock', {
            lockOwner: tokenHolder,
            lockIndex: 0,
            // totalAmountLocked: 0,
            // lockedUntil: 0, 
            // perTermInterest: 0,
            // durationInSecs: 0,
            isActive: true
        });

        const finishingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);

        assert(finishingBalances[tokenHolder] === startingBalances[tokenHolder] - amountToLock);
        assert(finishingBalances[lockerInstance.address] === startingBalances[lockerInstance.address] + amountToLock + interestEarned);
        assert(finishingBalances[interestEarnedAddress] === startingBalances[interestEarnedAddress] - interestEarned);

    });

    it("should allow an account to see how many locks it has", async () => {
        const startingNumLocks = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber();
        const amountToLock = 1000;

        await tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder });

        const finishingNumLocks = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber();

        assert(finishingNumLocks === startingNumLocks + 1);
    });

    it("should allow tokens to be unlocked", async () => {

        const startingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);
        const amountToLock = 1000;

        // create lock product with 10% per term, and 2 sec lock time:
        await lockerInstance.addLockProduct(100000, 2, 0, true);
        const interestEarned = Math.floor(amountToLock / 10);  // 10%

        const newLockProductId = (await lockerInstance.getLockProductCount()).toNumber() - 1;

        await tokenAceInstance.lockFunds(newLockProductId, amountToLock, { from: tokenHolder });

        await testHelpers.waitFor(2500);

        const newestLockIndex = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber() - 1;

        await lockerInstance.releaseFunds(tokenHolder, newestLockIndex);

        await assertEvent(lockerInstance, 'LockReleased', {
            lockOwner: tokenHolder,
            lockIndex: newestLockIndex
        });

        const finishingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);

        assert(finishingBalances[tokenHolder] === startingBalances[tokenHolder] + interestEarned);
        assert(finishingBalances[lockerInstance.address] === startingBalances[lockerInstance.address]);
        assert(finishingBalances[interestEarnedAddress] === startingBalances[interestEarnedAddress] - interestEarned);

    });

    it("should allow an account to see all it's locks", async () => {
        // NB: this test assumes that tokenHolder has less than 20 locks (when checking newestLock)

        // TODO: test returned data in locks more precisely

        const amountToLock = 1000;
        const startingTime = Math.floor(Date.now() / 1000);

        await tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder });

        const numLocks = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber();

        const locks = await lockerInstance.getLocksForAddress(tokenHolder, 0);

        // getLocksForAddress should return a 20 element array:
        assert.isArray(locks);
        assert(locks.length === 20);

        const newestLock = locks[numLocks - 1];

        // each lock should be a 5 element array
        assert.isArray(newestLock);
        assert(newestLock.length === 5);

        // the locks should be [ amountLocked, lockedUntil, perTermInterest, durationInSecs, isActive ] all
        // represented as uints (i.e. BigNumber objects in JS land):
        const [ amountLocked, lockedUntil, perTermInterest, durationInSecs, isActive ] = newestLock;
        assert(amountLocked.toNumber() > amountToLock);
        assert(lockedUntil.toNumber() > startingTime);
        assert(perTermInterest.toNumber() > 0);
        assert(durationInSecs.toNumber() > 0);
        assert(isActive.toNumber() === 1);

    });

    it("should prevent someone from locking more token than they have", async () => {

        const startingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);
        const amountToLock = startingBalances[tokenHolder] + 1000;

        await testHelpers.expectThrow(tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder }));

        const finishingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);

        assert(finishingBalances[tokenHolder] === startingBalances[tokenHolder]);
        assert(finishingBalances[lockerInstance.address] === startingBalances[lockerInstance.address]);
        assert(finishingBalances[interestEarnedAddress] === startingBalances[interestEarnedAddress]);

    });

    it("should prevent someone from locking less than the minimumLockAmount", async () => {

        const startingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);
        const minimumLockAmount = 1000;

        // create lock product with token minimum:
        await lockerInstance.addLockProduct(100000, 2, minimumLockAmount, true);

        const newLockProductId = (await lockerInstance.getLockProductCount()).toNumber() - 1;

        // can't lock less than the minimumLockAmount:
        await testHelpers.expectThrow(tokenAceInstance.lockFunds(newLockProductId, minimumLockAmount - 1, { from: tokenHolder }));

        const finishingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);

        assert(finishingBalances[tokenHolder] === startingBalances[tokenHolder]);
        assert(finishingBalances[lockerInstance.address] === startingBalances[lockerInstance.address]);
        assert(finishingBalances[interestEarnedAddress] === startingBalances[interestEarnedAddress]);

        // should allow someone to lock exactly the minimum:
        await tokenAceInstance.lockFunds(newLockProductId, minimumLockAmount, { from: tokenHolder });

    });

    it("should prevent someone from releasing a lock early", async () => {

        const startingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);
        const amountToLock = 1000;

        // lock funds, and get the product that was used:
        const [ product ] = await Promise.all([ lockerInstance.lockProducts(0), 
                                                tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder }) ]);

        const perTermInterest = product[0];
        const interestEarned = Math.floor(amountToLock * perTermInterest / 1000000);

        const newestLockIndex = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber() - 1;

        await testHelpers.expectThrow(lockerInstance.releaseFunds(tokenHolder, newestLockIndex));

        const finishingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);

        assert(finishingBalances[tokenHolder] === startingBalances[tokenHolder] - amountToLock);
        assert(finishingBalances[lockerInstance.address] === startingBalances[lockerInstance.address] + amountToLock + interestEarned);
        assert(finishingBalances[interestEarnedAddress] === startingBalances[interestEarnedAddress] - interestEarned);

    });

    it("should prevent someone from unlocking an unlocked lock", async () => {

        const startingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);
        const amountToLock = 1000;

        // create lock product with 10% per term, and 2 sec lock time:
        await lockerInstance.addLockProduct(100000, 2, 0, true);
        const interestEarned = Math.floor(amountToLock / 10);  // 10%

        const newLockProductId = (await lockerInstance.getLockProductCount()).toNumber() - 1;

        await tokenAceInstance.lockFunds(newLockProductId, amountToLock, { from: tokenHolder });

        await testHelpers.waitFor(2500);

        const newestLockIndex = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber() - 1;

        await lockerInstance.releaseFunds(tokenHolder, newestLockIndex);

        await testHelpers.expectThrow(lockerInstance.releaseFunds(tokenHolder, newestLockIndex));

        const finishingBalances = await getBalances(tokenAceInstance, [ tokenHolder, lockerInstance.address, interestEarnedAddress ]);

        assert(finishingBalances[tokenHolder] === startingBalances[tokenHolder] + interestEarned);
        assert(finishingBalances[lockerInstance.address] === startingBalances[lockerInstance.address]);
        assert(finishingBalances[interestEarnedAddress] === startingBalances[interestEarnedAddress] - interestEarned);

    });

    it("should only allow the token contract to call createLock", async () => {

        await testHelpers.expectThrow(lockerInstance.createLock(0, tokenHolder, 1000, { from: tokenHolder }));

    });

    it("should track the total amount of locked tokens", async () => {

        const startingLockedTokenCount = (await tokenAceInstance.balances(lockerInstance.address)).toNumber();
        const amountToLock = 1000;

        const [ product ] = await Promise.all([ lockerInstance.lockProducts(0), 
                                                tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder }) ]);

        const perTermInterest = product[0];
        const lockedInterested = Math.floor(amountToLock * perTermInterest / 1000000);

        const finishingLockedTokenCount = (await tokenAceInstance.balances(lockerInstance.address)).toNumber();

        assert(finishingLockedTokenCount === startingLockedTokenCount + amountToLock + lockedInterested);

    });

});
