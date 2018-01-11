
'use strict';

const Locker = artifacts.require('Locker');
const tokenAceTestHelper = new require('./helpers/tokenAceTestHelper.js');
const InterestEarnedAccount = artifacts.require('InterestEarnedAccount');

let tokenHolder = '';
let lockerInstance = null;
let tokenAceInstance = null;

contract('Lock', (accounts) => {

    before(async () => {

        const superUserAddress = accounts[0];
        tokenHolder = accounts[1];

        tokenAceInstance = await tokenAceTestHelper.newTokenAceMock(superUserAddress);
        lockerInstance = await Locker.new(tokenAceInstance.address);

        await tokenAceInstance.issue(20000);
        await tokenAceInstance.withdrawTokens(tokenHolder, 10000);
        await tokenAceInstance.withdrawTokens(InterestEarnedAccount.address, 10000);


    });

    it('should allow lock products to be created', async () => {

        // create lock product with 5% per annum, and 60 sec lock time:
        await lockerInstance.addLockProduct(50000, 60, true);

    });

    it('should allow the number of lock products to be queried', async () => {

        const startingNumLocks = (await lockerInstance.getLockProductCount()).toNumber();

        // create lock product with 5% per annum, and 120 sec lock time:
        await lockerInstance.addLockProduct(50000, 120, true);

        const endNumLocks = (await lockerInstance.getLockProductCount()).toNumber();

        assert(startingNumLocks + 1 === endNumLocks);

    });

    it('should allow the getting of individual lock products', async () => {

        // create lock product with 8% per annum, and 120 sec lock time:
        await lockerInstance.addLockProduct(80000, 120, true);

        const numLocks = (await lockerInstance.getLockProductCount()).toNumber();

        const product = await lockerInstance.lockProducts(numLocks - 1);

        // each product should be a 3 element array
        assert.isArray(product);
        assert(product.length === 3);

        // the product should be [ perAnnumInterest, durationInSecs, isActive ]:
        const [ perAnnumInterest, durationInSecs, isActive ] = product;
        assert(perAnnumInterest.toNumber() === 80000);
        assert(durationInSecs.toNumber() === 120);
        assert(isActive === true);

    });

    it('should allow the listing of lock products', async () => {

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
        const [ perAnnumInterest, durationInSecs, isActive ] = newestProduct;
        assert(perAnnumInterest.toNumber() === 100000);
        assert(durationInSecs.toNumber() === 120);
        assert(isActive.toNumber() === 1);

    });

    it('should allow lock products to be enabled/disabled', async () => {

        await lockerInstance.setLockProductActiveState(0, false);
        let product = await lockerInstance.lockProducts(0);

        assert(product[2] === false);

        await lockerInstance.setLockProductActiveState(0, true);
        product = await lockerInstance.lockProducts(0);

        assert(product[2] === true);

    });

    it('should allow tokens to be locked');

    it('should allow tokens to be unlocked');

    it('should allow an account to see how many locks it has');

    it('should allow an account to see all it\'s locks');

    it('should prevent someone from locking more token than they have');

    it('should prevent someone from releasing a lock early');
    
    it('should prevent someone from using a disactivated lock');
    
    it('should track the total amount of locked tokens');

});
