const RandomSeed = require("random-seed");
const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const exchangeTestHelper = require("./helpers/exchangeTestHelper.js");
const ratesTestHelper = new require("./helpers/ratesTestHelper.js");

const ONEWEI = 1000000000000000000;
const ETH_ROUND = 1000000000000; // 6 decimals places max in ETH

const ETH_SELL = 0;
const ETH_BUY = 1;

const ORDER_COUNT = 10;
const MARKET_WEI_RATE = 5000000; // 1ETH = 500 EUR
const MIN_ORDER_RATE = 9000;
const MAX_ORDER_RATE = 11000;
const MIN_TOKEN = 1000000; // 100 ACE
const MAX_TOKEN = 10000000; // 1,000 ACE
const TEST_ACCS_CT = web3.eth.accounts.length;
const ACC_INIT_ACE = 100000000;

let rates, tokenAce, exchange, peggedSymbol;
const random = new RandomSeed("Have the same test data");
let sellOrders = [];
let matches = [];
let matchArgs = [];
let stateAfterAllMatch = {};

const getOrderToFill = async () => {
    // this could be optimized ...
    const state = await exchangeTestHelper.getState();

    // retreive sell orders
    sellOrders = [];
    for (let i = 0; i < state.sellCount; i++) {
        sellOrders.push(await exchangeTestHelper.getSellOrder(i));
    }

    let match;
    for (let i = 0; i < state.buyCount && !match; i++) {
        const buyOrder = await exchangeTestHelper.getBuyOrder(i);
        for (let j = 0; j < sellOrders.length && !match; j++) {
            const sellOrder = sellOrders[j];

            if (buyOrder.price >= sellOrder.price) {
                match = { sellOrder: sellOrder, buyOrder: buyOrder };
            }
        }
    }
    return match;
};

/*
 NB: These tests dependend on each other i.e. place orders then match one by one has to run first
*/
contract("Exchange load tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock("EUR", MARKET_WEI_RATE);
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        peggedSymbol = web3.toAscii(await tokenAce.peggedSymbol());
        await tokenAce.issue(TEST_ACCS_CT * ACC_INIT_ACE);
        for (let i = 0; i < TEST_ACCS_CT; i++) {
            await tokenAce.withdrawTokens(accounts[i], ACC_INIT_ACE);
        }

        exchange = await exchangeTestHelper.newExchangeMock(tokenAce, rates, MIN_TOKEN);
    });

    it("place x buy / sell orders", async function() {
        let sellCt = 0;
        let buyCt = 0;
        for (let i = 0; i < ORDER_COUNT; i++) {
            const tokenAmount = Math.round(random.random() * 10000 * (MAX_TOKEN - MIN_TOKEN) / 10000) + MIN_TOKEN;
            const price = Math.floor(random.random() * (MAX_ORDER_RATE - MIN_ORDER_RATE)) + MIN_ORDER_RATE;
            const weiAmount =
                Math.round(tokenAmount * price / 10000 / MARKET_WEI_RATE * ONEWEI / ETH_ROUND) * ETH_ROUND;
            const orderType = random.random() < 0.5 ? ETH_SELL : ETH_BUY;
            if (orderType === ETH_SELL) {
                sellCt++;
            } else {
                buyCt++;
            }

            const order = {
                amount: orderType === ETH_SELL ? weiAmount : tokenAmount,
                maker: accounts[Math.floor(random.random() * (TEST_ACCS_CT - 1))],
                price: price,
                orderType: orderType,
                // expected values:
                sellEthOrderCount: sellCt,
                buyEthOrderCount: buyCt
            };
            await exchangeTestHelper.newOrder(this, order);
        }
        //await exchangeTestHelper.printOrderBook(10);
    });

    it("should fill x matching orders", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);
        let match = await getOrderToFill();
        while (match) {
            console.log(
                "MATCH:  Sell price: " + match.sellOrder.price / 10000,
                "  Buy price: " + match.buyOrder.price / 10000,
                "  Sell amount: " + web3.fromWei(match.sellOrder.amount) + " ETH",
                "  Buy amount: " + match.buyOrder.amount / 10000 + " ACE",
                "  Sell Id: " + match.sellOrder.id,
                "  Buy id: " + match.buyOrder.id
            );
            //await exchangeTestHelper.printOrderBook(10);
            await exchangeTestHelper.matchOrders(this, match.sellOrder, match.buyOrder, MARKET_WEI_RATE);

            // save match for later use by matchMultipleOrders test (calculating matches is time consuming)
            matches.push(match);
            match = await getOrderToFill();
        }

        // save state to compare it with matchMultipleOrders' results
        stateAfterAllMatch = await exchangeTestHelper.getState();

        //await exchangeTestHelper.printOrderBook(10);

        await testHelper.revertSnapshot(snapshotId);
    });

    /* FIXME: matchMultipleOrders() is not finished */
    it.skip("should x orders at once (matchMultipleOrders)", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);

        // convert & transpose matches to the format required by matchMultipleOrders
        matchArgs = matches.reduce(
            (args, match) => (
                args.sellIndexes.push(match.sellOrder.index),
                args.sellIds.push(match.sellOrder.id),
                args.buyIndexes.push(match.buyOrder.index),
                args.buyIds.push(match.buyOrder.id),
                args
            ),
            {
                sellIndexes: [],
                sellIds: [],
                buyIndexes: [],
                buyIds: []
            }
        );

        const tx = await exchange.matchMultipleOrders(
            matchArgs.sellIndexes,
            matchArgs.sellIds,
            matchArgs.buyIndexes,
            matchArgs.buyIds
        );
        testHelper.logGasUse(this, tx, "matchMultipleOrders");

        //await exchangeTestHelper.printOrderBook(10);

        const stateAfter = await exchangeTestHelper.getState();
        assert.equal(stateAfter.sellCount, stateAfterAllMatch.sellCount, "sellCount should == after 1by1 matching all");
        assert.equal(stateAfter.buyCount, stateAfterAllMatch.buyCount, "buyCount should == after 1by1 matching all");

        await testHelper.revertSnapshot(snapshotId);
    });

    it.skip("should cancel all orders", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);
        const stateBefore = await exchangeTestHelper.getState();

        // delete in a random order
        for (let i = stateBefore.sellCount - 1; i >= 0; i--) {
            const delIdx = Math.floor(random.random() * i);
            const order = await exchangeTestHelper.getSellOrder(delIdx);
            await exchangeTestHelper.cancelSellEthOrder(this, order);
        }

        for (let i = stateBefore.buyCount - 1; i >= 0; i--) {
            const delIdx = Math.floor(random.random() * i);
            const order = await exchangeTestHelper.getBuyOrder(delIdx);
            await exchangeTestHelper.cancelBuyEthOrder(this, order);
        }

        const stateAfter = await exchangeTestHelper.getState();

        //await exchangeTestHelper.printOrderBook(10);
        assert.equal(stateAfter.sellCount, 0);
        assert.equal(stateAfter.buyCount, 0);

        await testHelper.revertSnapshot(snapshotId);
    });
});
