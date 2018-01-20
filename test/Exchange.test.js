const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const exchangeTestHelper = require("./helpers/exchangeTestHelper.js");
const ratesTestHelper = new require("./helpers/ratesTestHelper.js");

const TOKEN_BUY = 0;
const TOKEN_SELL = 1;

let snapshotId;
let rates, tokenAce, exchange;
const maker = web3.eth.accounts[1];
const taker = web3.eth.accounts[2];

contract("Exchange tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock("EUR", 9980000);
        tokenAce = await tokenAceTestHelper.newTokenAceMock();

        await tokenAce.issue(1000000000);
        await tokenAce.withdrawTokens(maker, 100000000);
        await tokenAce.withdrawTokens(taker, 100000000);

        exchange = await exchangeTestHelper.newExchangeMock(tokenAce, rates, 1000000);
    });

    beforeEach(async function() {
        snapshotId = await testHelper.takeSnapshot();
    });

    afterEach(async function() {
        await testHelper.revertSnapshot(snapshotId);
    });

    it("place buy token orders", async function() {
        const order = { amount: web3.toWei(1), maker: maker, price: 11000, orderType: TOKEN_BUY };

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.newOrder(this, order);
        //await exchangeTestHelper.printOrderBook();
    });

    it("place sell token orders directly on Exchange", async function() {
        const order = { amount: 1000000, maker: maker, price: 11000, orderType: TOKEN_SELL, viaAugmintToken: false };

        const tx = await tokenAce.approve(exchange.address, order.amount * 2, { from: order.maker });
        testHelper.logGasUse(this, tx, "approve");

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.newOrder(this, order);
    });

    it("place a sell token order via AugmintToken", async function() {
        const order = { amount: 1000000, maker: maker, price: 11000, orderType: TOKEN_SELL };

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.newOrder(this, order);
    });

    it("shouldn't place a sell token order directly if approval < amount");

    it("shouldn't place a sell token order below minOrderAmount");
    it("shouldn't place a buy token order below minOrderAmount");
    it("shouldn't place a sell token order with 0 price");
    it("shouldn't place a buy token order with 0 price");

    it("no buy token order when user doesn't have enough ETH");
    it("no sell token order when user doesn't have enough ACE");

    it("should match two matching orders (buy token fully filled)", async function() {
        const buyTokenOrder = { amount: web3.toWei(0.535367), maker: maker, price: 10565, orderType: TOKEN_BUY };
        const sellTokenOrder = { amount: 9558237, maker: taker, price: 10263, orderType: TOKEN_SELL };
        const marketEurEth = 5000000;
        await rates.setRate("EUR", marketEurEth);

        await exchangeTestHelper.newOrder(this, buyTokenOrder);
        await exchangeTestHelper.newOrder(this, sellTokenOrder);
        //await exchangeTestHelper.printOrderBook(10);
        await exchangeTestHelper.matchOrders(this, buyTokenOrder, sellTokenOrder, marketEurEth);

        //await exchangeTestHelper.printOrderBook(10);
        const stateAfter = await exchangeTestHelper.getState();
        assert.equal(stateAfter.sellCount, 1, "Sell token order count should be 1");
        assert.equal(stateAfter.buyCount, 0, "Buy token order count should be 0");
    });

    it("should match two matching orders (sell token fully filled)", async function() {
        const buyTokenOrder = { amount: web3.toWei(1.750401), maker: maker, price: 10710, orderType: TOKEN_BUY };
        const sellTokenOrder = { amount: 5614113, maker: taker, price: 10263, orderType: TOKEN_SELL };
        const marketEurEth = 5000000;
        await rates.setRate("EUR", marketEurEth);

        await exchangeTestHelper.newOrder(this, buyTokenOrder);
        await exchangeTestHelper.newOrder(this, sellTokenOrder);
        //await exchangeTestHelper.printOrderBook(10);
        await exchangeTestHelper.matchOrders(this, buyTokenOrder, sellTokenOrder, marketEurEth);

        const stateAfter = await exchangeTestHelper.getState();
        assert.equal(stateAfter.sellCount, 0, "Sell token order count should be 0");
        assert.equal(stateAfter.buyCount, 1, "Buy token order count should be 1");
    });

    it("should match two matching orders (both fully filled)", async function() {
        const buyTokenOrder = { amount: web3.toWei(1), maker: maker, price: 12000, orderType: TOKEN_BUY };
        const sellTokenOrder = { amount: 4545455, maker: maker, price: 11000, orderType: TOKEN_SELL };
        const marketEurEth = 5000000;
        await rates.setRate("EUR", marketEurEth);

        await exchangeTestHelper.newOrder(this, buyTokenOrder);
        await exchangeTestHelper.newOrder(this, sellTokenOrder);
        //await exchangeTestHelper.printOrderBook(10);
        await exchangeTestHelper.matchOrders(this, buyTokenOrder, sellTokenOrder, marketEurEth);

        const stateAfter = await exchangeTestHelper.getState();
        assert.equal(stateAfter.sellCount, 0, "Sell token order count should be 0");
        assert.equal(stateAfter.buyCount, 0, "Buy token order count should be 0");
    });

    it("should match two matching orders from the same account", async function() {
        const buyTokenOrder = { amount: web3.toWei(1.750401), maker: maker, price: 10710, orderType: TOKEN_BUY };
        const sellTokenOrder = { amount: 5614113, maker: maker, price: 10263, orderType: TOKEN_SELL };
        const marketEurEth = 5000000;
        await rates.setRate("EUR", marketEurEth);

        await exchangeTestHelper.newOrder(this, buyTokenOrder);
        await exchangeTestHelper.newOrder(this, sellTokenOrder);
        //await exchangeTestHelper.printOrderBook(10);
        await exchangeTestHelper.matchOrders(this, buyTokenOrder, sellTokenOrder, marketEurEth);

        const stateAfter = await exchangeTestHelper.getState();
        assert.equal(stateAfter.sellCount, 0, "Sell token order count should be 0");
        assert.equal(stateAfter.buyCount, 1, "Buy token order count should be 1");
    });

    it("should NOT match two non-matching orders");
    it("should NOT match orders if one order removed");

    it("should match multiple orders"); // ensure edge cases of passing the same order twice
    it("multipleMatch should match as many orders as fits into gas provided");
    it("matchMultipleOrders should stop if one is non-matching");
    it("matchMultipleOrders should stop if one of the orders removed");

    it("should cancel a buy token order", async function() {
        const order = { amount: web3.toWei(1), maker: maker, price: 11000, orderType: TOKEN_BUY };

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.cancelOrder(this, order);
    });

    it("should cancel a sell token order", async function() {
        const order = { amount: 1000000, maker: maker, price: 11000, orderType: TOKEN_SELL };

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.cancelOrder(this, order);
    });

    it("only own orders should be possible to cancel");
    it("shouldn't cancel ETH buy order if orders changed");
    it("shouldn't cancel ETH sell order if orders changed");
});
