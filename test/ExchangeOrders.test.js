const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const exchangeTestHelper = require("./helpers/exchangeTestHelper.js");
const ratesTestHelper = new require("./helpers/ratesTestHelper.js");

const TOKEN_BUY = 0;
const TOKEN_SELL = 1;

let snapshotId;
let rates, tokenAce, exchange, minOrderAmount;
const maker = web3.eth.accounts[1];
const taker = web3.eth.accounts[2];

contract("Exchange tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock("EUR", 9980000);
        tokenAce = await tokenAceTestHelper.newTokenAceMock();

        await tokenAce.issue(1000000000);
        await tokenAce.withdrawTokens(maker, 100000000);
        await tokenAce.withdrawTokens(taker, 100000000);

        minOrderAmount = 1000000;
        exchange = await exchangeTestHelper.newExchangeMock(tokenAce, rates, minOrderAmount);
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

    it("shouldn't place a sell token order directly if approval < amount", async function() {
        const order = { amount: 1000000, maker: maker, price: 11000, orderType: TOKEN_SELL, viaAugmintToken: false };

        const tx = await tokenAce.approve(exchange.address, order.amount - 1, { from: order.maker });
        testHelper.logGasUse(this, tx, "approve");

        await testHelper.expectThrow(exchange.placeSellTokenOrder(order.price, order.amount, { from: order.maker }));
    });

    it("place a sell token order via AugmintToken", async function() {
        const order = { amount: 1000000, maker: maker, price: 11000, orderType: TOKEN_SELL };

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.newOrder(this, order);
    });

    it("only the owner should set minOrderAmount", async function() {
        await testHelper.expectThrow(exchange.setMinOrderAmount(500, { from: accounts[1] }));
    });

    it("should place a SELL token order at minOrderAmount", async function() {
        const price = 11000;
        const order = { amount: minOrderAmount, maker: maker, price: price, orderType: TOKEN_SELL };

        await exchangeTestHelper.newOrder(this, order);
    });

    it("should place a BUY token order at minOrderAmount", async function() {
        const price = 11000;
        //in solidity:
        // uint tokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(), msg.value.roundedDiv(price)).mul(10000);
        const orderValue = Math.round(minOrderAmount * price / 10000);
        const weiValue = await rates.convertToWei("EUR", orderValue);
        const order = { amount: weiValue, maker: maker, price: price, orderType: TOKEN_BUY };

        await exchangeTestHelper.newOrder(this, order);
    });

    it("shouldn't place a SELL token order below minOrderAmount", async function() {
        const price = 11000;
        await testHelper.expectThrow(
            tokenAce.placeSellTokenOrderOnExchange(exchange.address, price, minOrderAmount - 1, { from: maker })
        );
    });

    it("shouldn't place a BUY token order below minOrderAmount", async function() {
        const price = 11000;
        const orderValue = Math.round((minOrderAmount - 1) * price / 10000);
        const weiValue = await rates.convertToWei("EUR", orderValue);

        await testHelper.expectThrow(exchange.placeBuyTokenOrder(price, { value: weiValue }));
    });

    it("should place a low SELL token order amount if minOrderAmount set to 0", async function() {
        const price = 11000;
        const order = { amount: 1, maker: maker, price: price, orderType: TOKEN_SELL };
        const tx = await exchange.setMinOrderAmount(0);
        testHelper.logGasUse(this, tx, "setMinOrderAmount");

        await exchangeTestHelper.newOrder(this, order);
    });

    it("should place a low BUY token order amount if minOrderAmount is set to 0", async function() {
        const price = 11000;
        const weiValue = await rates.convertToWei("EUR", 1);
        const order = { amount: weiValue, maker: maker, price: price, orderType: TOKEN_BUY };
        const tx = await exchange.setMinOrderAmount(0);
        testHelper.logGasUse(this, tx, "setMinOrderAmount");

        await exchangeTestHelper.newOrder(this, order);
    });

    it("shouldn't place a SELL token order with 0 price even if minOrderAmount is 0", async function() {
        const price = 11000;
        const tx = await exchange.setMinOrderAmount(0);
        testHelper.logGasUse(this, tx, "setMinOrderAmount");
        await testHelper.expectThrow(
            tokenAce.placeSellTokenOrderOnExchange(exchange.address, price, 0, { from: maker })
        );
    });

    it("shouldn't place a BUY token order with 0 price even if minOrderAmount is 0", async function() {
        const price = 11000;
        const tx = await exchange.setMinOrderAmount(0);
        testHelper.logGasUse(this, tx, "setMinOrderAmount");
        await testHelper.expectThrow(exchange.placeBuyTokenOrder(price, { value: 0 }));
    });

    // this is redundant, ethereum core func & 0 value is tested previously:
    // it("no BUY token order when user doesn't have enough ETH");

    it("no SELL token order when user doesn't have enough ACE", async function() {
        const price = 11000;
        const userBal = await tokenAce.balanceOf(maker);
        assert(userBal > minOrderAmount, "user doesn't have enough balance for test");
        await testHelper.expectThrow(
            tokenAce.placeSellTokenOrderOnExchange(exchange.address, price, userBal + 1, { from: maker })
        );
    });

    it("should cancel a BUY token order", async function() {
        const order = { amount: web3.toWei(1), maker: maker, price: 11000, orderType: TOKEN_BUY };

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.cancelOrder(this, order);
    });

    it("should cancel a SELL token order", async function() {
        const order = { amount: 1000000, maker: maker, price: 11000, orderType: TOKEN_SELL };

        await exchangeTestHelper.newOrder(this, order);
        await exchangeTestHelper.cancelOrder(this, order);
    });

    it("only own orders should be possible to cancel", async function() {
        const buyOrder = { amount: web3.toWei(1), maker: maker, price: 12000, orderType: TOKEN_BUY };
        const sellOrder = { amount: 4545455, maker: maker, price: 11000, orderType: TOKEN_SELL };

        await exchangeTestHelper.newOrder(this, buyOrder);
        await exchangeTestHelper.newOrder(this, sellOrder);
        await testHelper.expectThrow(exchange.cancelBuyTokenOrder(buyOrder.index, buyOrder.id, { from: accounts[0] }));
        await testHelper.expectThrow(
            exchange.cancelSellTokenOrder(sellOrder.index, sellOrder.id, { from: accounts[0] })
        );
    });

    it("shouldn't cancel BUY order if order index changed", async function() {
        const buyOrder1 = { amount: web3.toWei(1), maker: maker, price: 12000, orderType: TOKEN_BUY };
        const buyOrder2 = { amount: web3.toWei(0.5), maker: maker, price: 11000, orderType: TOKEN_BUY };

        await exchangeTestHelper.newOrder(this, buyOrder1);
        await exchangeTestHelper.newOrder(this, buyOrder2);
        await exchangeTestHelper.cancelOrder(this, buyOrder1);
        await testHelper.expectThrow(
            exchange.cancelBuyTokenOrder(buyOrder2.index, buyOrder2.id, { from: buyOrder2.maker })
        );
    });

    it("shouldn't cancel SELL order if order index changed", async function() {
        const sellOrder1 = { amount: 2000000, maker: maker, price: 11000, orderType: TOKEN_SELL };
        const sellOrder2 = { amount: 1000000, maker: maker, price: 12000, orderType: TOKEN_SELL };

        await exchangeTestHelper.newOrder(this, sellOrder1);
        await exchangeTestHelper.newOrder(this, sellOrder2);
        await exchangeTestHelper.cancelOrder(this, sellOrder1);
        await testHelper.expectThrow(
            exchange.cancelSellTokenOrder(sellOrder2.index, sellOrder2.id, { from: sellOrder2.maker })
        );
    });
});
