const moment = require("moment");
const testHelper = new require("./testHelper.js");
const tokenAceTestHelper = require("./tokenAceTestHelper.js");
const Exchange = artifacts.require("./Exchange.sol");

const PLACE_ORDER_MAXFEE = web3.toWei(0.03);
const ETH_SELL = 0;
const ETH_BUY = 1;

module.exports = {
    newExchangeMock,
    newOrder,
    newOrderEventAsserts,
    orderMatchEventAsserts,
    contractStateAsserts,
    getSellOrder,
    getBuyOrder,
    printOrderBook
};

let exchange, tokenAce, rates;

async function newExchangeMock(_tokenAce, _rates, minOrderAmount) {
    tokenAce = _tokenAce;
    rates = _rates;
    exchange = await Exchange.new(tokenAce.address, rates.address, minOrderAmount);
    await tokenAce.grantMultiplePermissions(exchange.address, ["Exchange", "transferNoFee", "transferFromNoFee"]);
    return exchange;
}

async function newOrder(testInstance, order) {
    const testedAccounts = [exchange.address, order.maker];
    const balBefore = await tokenAceTestHelper.getBalances(testedAccounts);
    let tx, tokenAmount, weiAmount;
    let eventAssertLogIndex = 0;
    if (order.orderType === ETH_SELL) {
        tx = await exchange.placeSellEthOrder(order.price, {
            value: order.amount,
            from: order.maker
        });
        testHelper.logGasUse(testInstance, tx, "placeSellEthOrder");
        tokenAmount = 0;
        weiAmount = order.amount;
    } else {
        order.viaAugmintToken = typeof order.viaAugmintToken === "undefined" ? true : order.viaAugmintToken;
        if (order.viaAugmintToken) {
            eventAssertLogIndex = 1;
            tx = await tokenAce.placeBuyEthOrderOnExchange(exchange.address, order.price, order.amount, {
                from: order.maker
            });
            testHelper.logGasUse(testInstance, tx, "tokenAce.placeBuyEthOrderOnExchange");
        } else {
            const approvedBefore = await tokenAce.allowed(order.maker, exchange.address);
            tx = await exchange.placeBuyEthOrder(order.price, order.amount, {
                from: order.maker
            });
            testHelper.logGasUse(testInstance, tx, "tokenAce.placeBuyEthOrderOnExchange");
            const approvedAfter = await tokenAce.allowed(order.maker, exchange.address);
            assert.equal(
                approvedAfter.toString(),
                approvedBefore.sub(order.amount).toString(),
                "approval for maker should be updated"
            );
        }

        tokenAmount = order.amount;
        weiAmount = 0;
    }
    await newOrderEventAsserts(order, tx.logs[eventAssertLogIndex]);

    await contractStateAsserts(order);
    const expBalances = [
        {
            name: "exchange contract",
            address: exchange.address,
            ace: balBefore[0].ace.plus(tokenAmount),
            eth: balBefore[0].eth.plus(weiAmount)
        },
        {
            name: "maker",
            address: order.maker,
            gasFee: PLACE_ORDER_MAXFEE,
            ace: balBefore[1].ace.minus(tokenAmount),
            eth: balBefore[1].eth.minus(weiAmount)
        }
    ];

    await tokenAceTestHelper.balanceAsserts(expBalances);
}

async function newOrderEventAsserts(order, logItem) {
    order.viaAugmintToken = typeof order.viaAugmintToken === "undefined" ? true : order.viaAugmintToken;
    if (order.orderType === ETH_BUY && order.viaAugmintToken) {
        // TODO: hack b/c truffle doesn't pick up events emmitted from contracts called by the invoked contracts
        const orderCounts = await exchange.getOrderCounts();
        order.index = orderCounts[1].toNumber() - 1;
        order.id = (await exchange.lastOrderId()).toNumber();
        assert.equal(logItem.event, "AugmintTransfer", "AugmintTransfer event should be emited");
        assert.equal(logItem.args.from, order.maker, "from: should be the maker");
        assert.equal(logItem.args.to, exchange.address, "to: should be the exchange");
        assert.equal(logItem.args.amount.toString(), order.amount, "transfer amount should be the order amount");
    } else {
        let eventName, amount;
        if (order.orderType === ETH_SELL) {
            eventName = "NewSellEthOrder";
            amount = logItem.args.weiAmount.toString();
        } else {
            eventName = "NewBuyEthOrder";
            amount = logItem.args.tokenAmount.toString();
        }

        assert.equal(logItem.event, eventName, eventName + " event should be emited");
        order.id = logItem.args.orderId.toNumber();
        order.index = logItem.args.orderIndex.toNumber();
        assert.isNumber(order.index, "orderIndex should be set to a number");
        assert.isNumber(order.id, "orderId should be set to a number");
        assert.equal(logItem.args.maker, order.maker, "maker should be the initiating userAccount");
        assert.equal(logItem.args.price.toString(), order.price.toString(), "price should be set");
        assert.equal(amount, order.amount, "amount should be set");
    }
    return;
}

function orderMatchEventAsserts(logItem, expMatch) {
    assert.equal(logItem.event, "OrderFill", "OrderFill event should be emited");
    const ret = { buyOrder: {}, sellOrder: {} };
    ret.buyOrder.id = logItem.args.buyOrderId.toNumber();
    ret.sellOrder.id = logItem.args.sellOrderId.toNumber();
    assert.isNumber(ret.buyOrder.id, "OrderFill sellEthOrderId should be set to a number");
    assert.isNumber(ret.sellOrder.id, "OrderFill buyOrderId should be set to a number");
    assert.equal(logItem.args.buyer, expMatch.buyer, "OrderFill buyer should be the initiating userAccount");
    assert.equal(logItem.args.seller, expMatch.seller, "OrderFill seller should be the initiating userAccount");

    assert.equal(logItem.args.price.toString(), expMatch.price.toString(), "OrderFill price should be set");
    assert.equal(logItem.args.weiAmount.toString(), expMatch.weiAmount.toString(), "OrderFill weiAmount should be set");
    assert.equal(
        logItem.args.tokenAmount.toString(),
        expMatch.tokenAmount.toString(),
        "OrderFill tokenAmount should be set"
    );
    return ret;
}

async function contractStateAsserts(expOrder) {
    const orderCounts = await exchange.getOrderCounts();
    assert.equal(orderCounts[0].toString(), expOrder.sellEthOrderCount, "sellEthOrderCount should be set");
    assert.equal(orderCounts[1].toString(), expOrder.buyEthOrderCount, "buyEthOrderCount should be set");
    let order;
    if (expOrder.orderType === ETH_SELL) {
        order = await exchange.sellEthOrders(expOrder.index);
    } else {
        order = await exchange.buyEthOrders(expOrder.index);
    }

    assert.equal(order[0].toNumber(), expOrder.id, "orderId should be set in contract's order array");
    assert.equal(order[1], expOrder.maker, "maker should be the userAccount in contract's order array");
    // TODO: assert time (addedTime[2])
    assert.equal(order[3].toString(), expOrder.price.toString(), "price should be set in contract's order array");
    assert.equal(order[4].toString(), expOrder.amount, "amount should be set in contract's order array");
}

async function getSellOrder(i) {
    const order = parseOrder(await exchange.sellEthOrders(i));
    order.index = i;
    return order;
}

async function getBuyOrder(i) {
    const order = parseOrder(await exchange.buyEthOrders(i));
    order.index = i;
    return order;
}

function parseOrder(order) {
    const ret = {
        id: order[0].toNumber(),
        maker: order[1],
        addedTime: order[2],
        price: order[3],
        amount: order[4]
    };
    return ret;
}

async function printOrderBook(limit) {
    const orderCounts = await exchange.getOrderCounts();
    const sellCt = orderCounts[0].toNumber();
    const buyCt = orderCounts[1].toNumber();
    let limitText;
    if (typeof limit === "undefined") {
        limit = sellCt > buyCt ? sellCt : buyCt;
        limitText = "(all orders)";
    } else {
        limitText = "(top " + limit + " orders)";
    }
    console.log("========= Order Book " + limitText + " =========");
    console.log("  Buy ct: " + buyCt + "    Sell ct: " + sellCt);

    for (let i = 0; i < buyCt && i < limit; i++) {
        const order = await getBuyOrder(i);
        console.log(
            "BUY: ",
            "ACE/EUR: " + order.price.div(10000).toString(),
            "amount: " + order.amount.div(10000).toString() + " ACE ",
            moment.unix(order.addedTime).format("HH:mm:ss"),
            "orderIdx: " + i,
            "orderId: " + order.id,
            "acc: " + order.maker
        );
    }

    for (let i = 0; i < sellCt && i < limit; i++) {
        const order = await getSellOrder(i);
        console.log(
            "        SELL: ",
            "ACE/EUR: " + order.price.div(10000).toString(),
            "amount: " + web3.fromWei(order.amount) + " ETH ",
            moment.unix(order.addedTime).format("HH:mm:ss"),
            "orderIdx: " + i,
            "orderId: " + order.id,
            "acc: " + order.maker
        );
    }

    console.log("=========/Order Book =========");
}
