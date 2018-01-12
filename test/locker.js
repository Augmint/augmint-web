"use strict";

const Locker = artifacts.require("Locker");
const InterestEarnedAccount = artifacts.require("InterestEarnedAccount");

const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const testHelpers = require("./helpers/testHelper.js");

let tokenHolder = "";
let lockerInstance = null;
let tokenAceInstance = null;

contract("Lock", accounts => {
    before(async () => {
        const superUserAddress = accounts[0];
        tokenHolder = accounts[1];

        tokenAceInstance = await tokenAceTestHelper.newTokenAceMock(superUserAddress);
        lockerInstance = await Locker.new(tokenAceInstance.address);

        await tokenAceInstance.setLocker(lockerInstance.address);
        await tokenAceInstance.grantPermission(lockerInstance.address, "transferNoFee");

        await tokenAceInstance.issue(20000);
        await tokenAceInstance.withdrawTokens(tokenHolder, 10000);
        await tokenAceInstance.withdrawTokens(InterestEarnedAccount.address, 10000);
    });

    it("should allow lock products to be created", async () => {
        // create lock product with 5% per annum, and 60 sec lock time:
        await lockerInstance.addLockProduct(50000, 60, true);
    });

    it("should allow the number of lock products to be queried", async () => {
        const startingNumLocks = (await lockerInstance.getLockProductCount()).toNumber();

        // create lock product with 5% per annum, and 120 sec lock time:
        await lockerInstance.addLockProduct(50000, 120, true);

        const endNumLocks = (await lockerInstance.getLockProductCount()).toNumber();

        assert(startingNumLocks + 1 === endNumLocks);
    });

    it("should allow the getting of individual lock products", async () => {
        // create lock product with 8% per annum, and 120 sec lock time:
        await lockerInstance.addLockProduct(80000, 120, true);

        const numLocks = (await lockerInstance.getLockProductCount()).toNumber();

        const product = await lockerInstance.lockProducts(numLocks - 1);

        // each product should be a 3 element array
        assert.isArray(product);
        assert(product.length === 3);

        // the product should be [ perAnnumInterest, durationInSecs, isActive ]:
        const [perAnnumInterest, durationInSecs, isActive] = product;
        assert(perAnnumInterest.toNumber() === 80000);
        assert(durationInSecs.toNumber() === 120);
        assert(isActive === true);
    });

    it("should allow the listing of lock products", async () => {
        // create lock product with 10% per annum, and 120 sec lock time:
        await lockerInstance.addLockProduct(100000, 120, true);

        const numLocks = (await lockerInstance.getLockProductCount()).toNumber();

        const products = await lockerInstance.getLockProducts(0);

        // getLockProducts should return a 20 element array:
        assert.isArray(products);
        assert(products.length === 20);

        const newestProduct = products[numLocks - 1];

        // each product should be a 3 element array
        assert.isArray(newestProduct);
        assert(newestProduct.length === 3);

        // the products should be [ perAnnumInterest, durationInSecs, isActive ] all
        // represented as uints (i.e. BigNumber objects in JS land):
        const [perAnnumInterest, durationInSecs, isActive] = newestProduct;
        assert(perAnnumInterest.toNumber() === 100000);
        assert(durationInSecs.toNumber() === 120);
        assert(isActive.toNumber() === 1);
    });

    it("should allow lock products to be enabled/disabled", async () => {
        await lockerInstance.setLockProductActiveState(0, false);
        let product = await lockerInstance.lockProducts(0);

        assert(product[2] === false);

        await lockerInstance.setLockProductActiveState(0, true);
        product = await lockerInstance.lockProducts(0);

        assert(product[2] === true);
    });

    it("should allow tokens to be locked", async () => {
        // TODO: also test balances of interestEarned and locker

        const startingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();
        const amountToLock = 1000;

        await tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder });

        const finishingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();

        assert(finishingBalance === startingBalance - amountToLock);
    });

    it("should allow an account to see how many locks it has", async () => {
        const startingNumLocks = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber();
        const amountToLock = 1000;

        await tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder });

        const finishingNumLocks = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber();

        assert(finishingNumLocks === startingNumLocks + 1);
    });

    it("should allow tokens to be unlocked", async () => {
        // TODO: check balances more thoroughly

        const startingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();
        const amountToLock = 1000;

        // create lock product with 10% per annum, and 2 sec lock time:
        await lockerInstance.addLockProduct(100000, 2, true);

        const newLockProductId = (await lockerInstance.getLockProductCount()).toNumber() - 1;

        await tokenAceInstance.lockFunds(newLockProductId, amountToLock, { from: tokenHolder });

        await testHelpers.waitFor(2500);

        const newestLockId = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber() - 1;

        await lockerInstance.releaseFunds(tokenHolder, newestLockId);

        const finishingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();

        assert(finishingBalance > startingBalance);
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

        // each lock should be a 3 element array
        assert.isArray(newestLock);
        assert(newestLock.length === 3);

        // the locks should be [ amountLocked, lockedUntil, isActive ] all
        // represented as uints (i.e. BigNumber objects in JS land):
        const [amountLocked, lockedUntil, isActive] = newestLock;
        assert(amountLocked.toNumber() > amountToLock);
        assert(lockedUntil.toNumber() > startingTime);
        assert(isActive.toNumber() === 1);
    });

    it("should prevent someone from locking more token than they have", async () => {
        // TODO: check all balances

        const startingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();
        const amountToLock = startingBalance + 1000;
        let success = true;

        try {
            await tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder });
        } catch (err) {
            success = false;
        }

        const finishingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();

        assert(!success);
        assert(finishingBalance === startingBalance);
    });

    it("should prevent someone from releasing a lock early", async () => {
        // TODO: check balances more thoroughly

        const startingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();
        const amountToLock = 1000;
        let success = true;

        await tokenAceInstance.lockFunds(0, amountToLock, { from: tokenHolder });

        const newestLockId = (await lockerInstance.getLockCountForAddress(tokenHolder)).toNumber() - 1;

        try {
            await lockerInstance.releaseFunds(tokenHolder, newestLockId);
        } catch (err) {
            // TODO: use testHelper expectThrow
            success = false;
        }

        const finishingBalance = (await tokenAceInstance.balances(tokenHolder)).toNumber();

        assert(!success);
        assert(finishingBalance === startingBalance - amountToLock);
    });

    it("should track the total amount of locked tokens");

    it("should prevent someone from using a disactivated lock");

    it("should only allow the token contract to call createLock and disableLock");
});
