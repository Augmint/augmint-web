const RandomSeed = require("random-seed");
const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const exchangeTestHelper = require("./helpers/exchangeTestHelper.js");
const ratesTestHelper = new require("./helpers/ratesTestHelper.js");

const ONEWEI = 1000000000000000000;
const ETH_ROUND = 1000000000000; // 6 decimals places max in ETH

const TOKEN_BUY = 0;
const TOKEN_SELL = 1;

const ORDER_COUNT = 10;
const MARKET_WEI_RATE = 5000000; // 1ETH = 500 EUR
const MIN_ORDER_RATE = 9000;
const MAX_ORDER_RATE = 11000;
const MIN_TOKEN = 1000000; // 100 ACE
const MAX_TOKEN = 10000000; // 1,000 ACE
const TEST_ACCS_CT = web3.eth.accounts.length;
const ACC_INIT_ACE = 100000000;

let rates, tokenAce, exchange;
const random = new RandomSeed("Have the same test data");
let buyTokenOrders = null;
let sellTokenOrders = null;
let matches = [];
let matchArgs = [];
let stateAfterAllMatch = {};

const getOrderToFill = async () => {
    const state = await exchangeTestHelper.getState();

    // retreive all orders
    buyTokenOrders = [];
    sellTokenOrders = [];
    const queryCount = Math.ceil((state.sellCount + state.buyCount) / 50);
    for (let i = 0; i < queryCount; i++) {
        const fetchedOrders = await exchangeTestHelper.getOrders(i * 50);
        buyTokenOrders = buyTokenOrders.concat(fetchedOrders.buyOrders);
        sellTokenOrders = sellTokenOrders.concat(fetchedOrders.sellOrders);
    }

    // find match
    let match = null;
    for (let buyIdx = 0; !match && buyIdx < state.buyCount; buyIdx++) {
        for (let sellIdx = 0; !match && sellIdx < state.sellCount; sellIdx++) {
            if (sellTokenOrders[sellIdx].price <= buyTokenOrders[buyIdx].price) {
                match = { buyTokenOrder: buyTokenOrders[buyIdx], sellTokenOrder: sellTokenOrders[sellIdx] };
            }
        }
    }
    return match;
};

/*
 NB: These tests dependend on each other i.e. place orders then match one by one has to run first
*/
contract("Exchange random tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock("EUR", MARKET_WEI_RATE);
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        await tokenAce.issue(TEST_ACCS_CT * ACC_INIT_ACE);
        console.log(`\x1b[2m\t*** Topping up ${TEST_ACCS_CT} accounts each with ${ACC_INIT_ACE / 10000} A-EURO\x1b[0m`);
        await Promise.all(accounts.slice(0, TEST_ACCS_CT).map(acc => tokenAce.withdrawTokens(acc, ACC_INIT_ACE)));

        exchange = await exchangeTestHelper.newExchangeMock(tokenAce, rates, MIN_TOKEN);
    });

    it("place x buy / sell orders", async function() {
        const orders = [];
        for (let i = 0; i < ORDER_COUNT; i++) {
            const tokenAmount = Math.round(random.random() * 10000 * (MAX_TOKEN - MIN_TOKEN) / 10000) + MIN_TOKEN;
            const price = Math.floor(random.random() * (MAX_ORDER_RATE - MIN_ORDER_RATE)) + MIN_ORDER_RATE;
            const weiAmount =
                Math.round(tokenAmount * price / 10000 / MARKET_WEI_RATE * ONEWEI / ETH_ROUND) * ETH_ROUND;
            const orderType = random.random() < 0.5 ? TOKEN_BUY : TOKEN_SELL;

            orders.push({
                amount: orderType === TOKEN_BUY ? weiAmount : tokenAmount,
                maker: accounts[Math.floor(random.random() * (TEST_ACCS_CT - 1))],
                price: price,
                orderType: orderType
            });
        }

        console.log(`\x1b[2m\t*** Placing ${ORDER_COUNT} random orders\t\x1b[0m`);
        const txs = await Promise.all(
            orders.map(order => {
                let tx;
                if (order.orderType === TOKEN_BUY) {
                    tx = exchange.placeBuyTokenOrder(order.price, { value: order.amount, from: order.maker });
                } else {
                    tx = tokenAce.placeSellTokenOrderOnExchange(exchange.address, order.price, order.amount, {
                        from: order.maker
                    });
                }
                return tx;
            })
        );
        txs.map(tx =>
            testHelper.logGasUse(
                this,
                tx,
                typeof tx.logs[0].args.weiAmount === "undefined"
                    ? "placeBuyTokenOrder"
                    : "tokenAce.placeSellTokenOrderOnExchange"
            )
        );
        assert(txs.length, ORDER_COUNT);
        //await exchangeTestHelper.printOrderBook(10);
    });

    it("should fill x matching orders", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);
        let match = await getOrderToFill();
        let ct = 0;
        console.log("");
        while (match) {
            ct++;
            console.log(
                `\x1b[1A\x1b[2m\t*** Sending match #${ct} on ETH/EUR rate: ${MARKET_WEI_RATE / 10000}\t\x1b[0m`
            );
            //await exchangeTestHelper.printOrderBook(10);
            await exchangeTestHelper.matchOrders(this, match.buyTokenOrder, match.sellTokenOrder, MARKET_WEI_RATE);

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
    it.skip("should match x orders at once (matchMultipleOrders)", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);

        // convert & transpose matches to the format required by matchMultipleOrders
        matchArgs = matches.reduce(
            (args, match) => (
                args.buyTokenIndexes.push(match.buyTokenOrder.index),
                args.buyTokenIds.push(match.buyTokenOrder.id),
                args.sellTokenIndexes.push(match.sellTokenOrder.index),
                args.sellTokenIds.push(match.sellTokenOrder.id),
                args
            ),
            {
                buyTokenIndexes: [],
                buyTokenIds: [],
                sellTokenIndexes: [],
                sellTokenIds: []
            }
        );

        const tx = await exchange.matchMultipleOrders(
            matchArgs.buyTokenIndexes,
            matchArgs.buyTokenIds,
            matchArgs.sellTokenIndexes,
            matchArgs.sellTokenIds
        );
        testHelper.logGasUse(this, tx, "matchMultipleOrders");

        //await exchangeTestHelper.printOrderBook(10);

        const stateAfter = await exchangeTestHelper.getState();
        assert.equal(stateAfter.sellCount, stateAfterAllMatch.sellCount, "sellCount should == after 1by1 matching all");
        assert.equal(stateAfter.buyCount, stateAfterAllMatch.buyCount, "buyCount should == after 1by1 matching all");

        await testHelper.revertSnapshot(snapshotId);
    });

    it("should cancel all orders", async function() {
        const snapshotId = await testHelper.takeSnapshot();
        //await exchangeTestHelper.printOrderBook(10);
        const stateBefore = await exchangeTestHelper.getState();

        // delete in a random order
        console.log("");
        for (let i = stateBefore.buyCount - 1; i >= 0; i--) {
            const delIdx = Math.floor(random.random() * i);
            console.log(
                `\x1b[1A\x1b[2m\t*** Cancelling buy order #${stateBefore.buyCount - i} / ${
                    stateBefore.buyCount
                } (idx: ${delIdx})\t\x1b[0m`
            );
            const order = await exchangeTestHelper.getBuyTokenOrder(delIdx);
            await exchangeTestHelper.cancelOrder(this, order);
        }

        console.log("");
        for (let i = stateBefore.sellCount - 1; i >= 0; i--) {
            const delIdx = Math.floor(random.random() * i);
            console.log(
                `\x1b[1A\x1b[2m\t*** Cancelling sell order #${stateBefore.sellCount - i} / ${
                    stateBefore.sellCount
                } (idx: ${delIdx})\t\x1b[0m`
            );
            const order = await exchangeTestHelper.getSellTokenOrder(delIdx);
            await exchangeTestHelper.cancelOrder(this, order);
        }

        const stateAfter = await exchangeTestHelper.getState();

        //await exchangeTestHelper.printOrderBook(10);
        assert.equal(stateAfter.sellCount, 0);
        assert.equal(stateAfter.buyCount, 0);

        await testHelper.revertSnapshot(snapshotId);
    });
});
