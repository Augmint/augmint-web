const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const exchangeTestHelper = require("./helpers/exchangeTestHelper.js");
const ratesTestHelper = new require("./helpers/ratesTestHelper.js");

const ONEWEI = 1000000000000000000;
const ETH_SELL = 0;
const ETH_BUY = 1;

let snapshotId;
let rates, tokenAce, exchange, peggedSymbol;
const maker = web3.eth.accounts[1];
const taker = web3.eth.accounts[2];

contract("Exchange tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock("EUR", 9980000);
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        peggedSymbol = web3.toAscii(await tokenAce.peggedSymbol());
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

    it("place sell Eth orders", async function() {
        const order = {
            amount: web3.toWei(1),
            maker: maker,
            price: 11000,
            orderType: ETH_SELL,
            // expected values:
            sellEthOrderCount: 1,
            buyEthOrderCount: 0,
            mapIdx: 0
        };

        await exchangeTestHelper.newOrder(this, order);
        order.mapIdx = 1;
        order.sellEthOrderCount = 2;
        await exchangeTestHelper.newOrder(this, order);
        //await exchangeTestHelper.printOrderBook();
    });

    it("place buy ETH orders directly on Exchange", async function() {
        const order = {
            amount: 1000000,
            maker: maker,
            price: 110000,
            orderType: ETH_BUY,
            viaAugmintToken: false,
            // expected values:
            sellEthOrderCount: 0,
            buyEthOrderCount: 1,
            mapIdx: 0
        };

        const tx = await tokenAce.approve(exchange.address, order.amount * 2, { from: order.maker });
        testHelper.logGasUse(this, tx, "approve");
        await exchangeTestHelper.newOrder(this, order);
        order.mapIdx = 1;
        order.buyEthOrderCount = 2;
        await exchangeTestHelper.newOrder(this, order);
    });

    it("place a buy ETH orders via AugmintToken", async function() {
        const order = {
            amount: 1000000,
            maker: maker,
            price: 110000,
            orderType: ETH_BUY,
            // expected values:
            sellEthOrderCount: 0,
            buyEthOrderCount: 1,
            mapIdx: 0
        };

        await exchangeTestHelper.newOrder(this, order);
        order.mapIdx = 1;
        order.buyEthOrderCount = 2;
        await exchangeTestHelper.newOrder(this, order);
    });

    it("shouldn't place a buy ETH order directly if approval < amount");

    it("shouldn't place a buy ETH order below minOrderAmount");
    it("shouldn't place a sell ETH order below minOrderAmount");
    it("shouldn't place a buy ETH order with 0 price");
    it("shouldn't place a sell ETH order with 0 price");

    it("no sell Eth order when user doesn't have enough ETH");
    it("no buy Eth order when user doesn't have enough ACE");

    it("should be able to match my own order");

    it("should match two matching orders (sell ETH partially filled)", async function() {
        const sellOrder = {
            amount: web3.toWei(1),
            maker: maker,
            price: 11000,
            orderType: ETH_SELL,
            // expected values:
            sellEthOrderCount: 1,
            buyEthOrderCount: 0,
            mapIdx: 0
        };

        const buyOrder = {
            amount: 1000000,
            maker: taker,
            price: 11000,
            orderType: ETH_BUY,
            // expected values:
            sellEthOrderCount: 1,
            buyEthOrderCount: 1,
            mapIdx: 0
        };
        const marketEurEth = 10000000;
        await rates.setRate("EUR", marketEurEth);
        await exchangeTestHelper.newOrder(this, sellOrder);
        await exchangeTestHelper.newOrder(this, buyOrder);
        //await exchangeTestHelper.printOrderBook(10);
        const tx = await exchange.matchOrders(0, 0);
        testHelper.logGasUse(this, tx, "matchOrders");
        const expPrice =
            Math.abs(buyOrder.price - 1) > Math.abs(sellOrder.price - 1) ? sellOrder.price : buyOrder.price;
        const expMatch = {
            buyer: buyOrder.maker,
            seller: sellOrder.maker,
            price: expPrice,
            weiAmount: marketEurEth / 10000 * expPrice / 10000 * buyOrder.amount / 10000 * (ONEWEI / 1000000),
            tokenAmount: buyOrder.amount
        };

        exchangeTestHelper.orderMatchEventAsserts(tx.logs[0], expMatch);
        //await exchangeTestHelper.printOrderBook();
        // TODO: asserts: orderCounts + orders in contract
    });

    it("should match two matching orders (buy ETH partially filled)");
    it("should match two matching orders (both fully filled)");
    it("should NOT match two non-matching orders");

    it("should match multiple orders");

    it("should NOT match multiple orders if one is non-matching");

    it("should cancel a sell ETH order", async function() {
        const order = {
            amount: web3.toWei(1),
            maker: maker,
            price: 110000,
            orderType: ETH_SELL,
            // expected values:
            sellEthOrderCount: 1,
            buyEthOrderCount: 0,
            mapIdx: 0
        };

        await exchangeTestHelper.newOrder(this, order);
        const tx = await exchange.cancelSellEthOrder(order.id, { from: order.maker });
        testHelper.logGasUse(this, tx, "cancelSellEthOrder");
    });

    it("should cancel a buy ETH order", async function() {
        const order = {
            amount: 1000000,
            maker: maker,
            price: 110000,
            orderType: ETH_BUY,
            // expected values:
            sellEthOrderCount: 0,
            buyEthOrderCount: 1,
            mapIdx: 0
        };

        await exchangeTestHelper.newOrder(this, order);
        const tx = await exchange.cancelBuyEthOrder(order.id, { from: order.maker });
        testHelper.logGasUse(this, tx, "cancelBuyEthOrder");
    });

    it("only own orders should be possible to cancel");
});
