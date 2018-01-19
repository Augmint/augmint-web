const moment = require("moment");
const testHelper = new require("./testHelper.js");
const tokenAceTestHelper = require("./tokenAceTestHelper.js");
const Exchange = artifacts.require("./Exchange.sol");

const ONEWEI = 1000000000000000000;
const PLACE_ORDER_MAXFEE = web3.toWei(0.03);
const CANCEL_SELL_MAXFEE = web3.toWei(0.03);
const ETH_SELL = 0;
const ETH_BUY = 1;

module.exports = {
    newExchangeMock,
    newOrder,
    cancelBuyEthOrder,
    cancelSellEthOrder,
    newOrderEventAsserts,
    matchOrders,
    contractStateAsserts,
    getState,
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
    let tx;
    let eventAssertLogIndex = 0;

    if (order.orderType === ETH_SELL) {
        tx = await exchange.placeSellEthOrder(order.price, {
            value: order.amount,
            from: order.maker
        });
        testHelper.logGasUse(testInstance, tx, "placeSellEthOrder");
        order.tokenAmount = 0;
        order.weiAmount = order.amount; //, 10); // parsint b/c eventAssers === comp, fails even if both numbers?
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

        order.tokenAmount = order.amount;
        order.weiAmount = 0;
    }
    await newOrderEventAsserts(order, tx.logs[eventAssertLogIndex]);

    await contractStateAsserts(order);
    const expBalances = [
        {
            name: "exchange contract",
            address: exchange.address,
            ace: balBefore[0].ace.plus(order.tokenAmount),
            eth: balBefore[0].eth.plus(order.weiAmount)
        },
        {
            name: "maker",
            address: order.maker,
            gasFee: PLACE_ORDER_MAXFEE,
            ace: balBefore[1].ace.minus(order.tokenAmount),
            eth: balBefore[1].eth.minus(order.weiAmount)
        }
    ];

    await tokenAceTestHelper.balanceAsserts(expBalances);
}

async function newOrderEventAsserts(order, logItem) {
    // TODO: const ret = await testHelper.assertEvent(exchange, "OrderFill", {
    //     buyOrderId: x => Number.isInteger(x),
    //     sellOrderId: x => Number.isInteger(x),
    //     buyer: expMatch.buyer,
    //     seller: expMatch.seller,
    //     price: expMatch.price,
    //     weiAmount: expMatch.weiAmount,
    //     tokenAmount: expMatch.tokenAmount
    // });
    order.viaAugmintToken = typeof order.viaAugmintToken === "undefined" ? true : order.viaAugmintToken;
    if (order.orderType === ETH_BUY && order.viaAugmintToken) {
        // TODO: hack b/c truffle doesn't pick up events emmitted from contracts called by the invoked contracts
        const orderCounts = await exchange.getOrderCounts();
        order.index = orderCounts[1].toNumber() - 1;
        order.id = (await exchange.lastOrderId()).toNumber();
        assert.equal(logItem.event, "AugmintTransfer", "AugmintTransfer event should be emited");
        assert.equal(logItem.args.from, order.maker, "from: should be the maker");
        assert.equal(logItem.args.to, exchange.address, "to: should be the exchange");
        assert.equal(logItem.args.amount.toNumber(), order.amount, "transfer amount should be the order amount");
    } else {
        assert.equal(logItem.event, "NewOrder", "NewOrder event should be emited");

        order.id = logItem.args.orderId.toNumber();
        order.index = logItem.args.orderIndex.toNumber();
        assert.isNumber(order.index, "orderIndex should be set to a number");
        assert.isNumber(order.id, "orderId should be set to a number");
        assert.equal(logItem.args.maker, order.maker, "maker should be the initiating userAccount");
        assert.equal(logItem.args.price.toNumber(), order.price, "price should be set");
        assert.equal(logItem.args.tokenAmount.toNumber(), order.tokenAmount, "tokenAmount should be set");
        assert.equal(logItem.args.weiAmount.toNumber(), order.weiAmount, "weiAmount should be set");
    }
    return;
}

async function cancelBuyEthOrder(testInstance, order) {
    const stateBefore = await getState();
    const balBefore = await tokenAceTestHelper.getAllBalances({ exchange: exchange.address, maker: order.maker });

    const tx = await exchange.cancelBuyEthOrder(order.index, order.id, { from: order.maker });
    testHelper.logGasUse(testInstance, tx, "cancelBuyEthOrder");
    await testHelper.assertEvent(exchange, "CancelledOrder", {
        orderId: order.id,
        maker: order.maker,
        tokenAmount: order.amount,
        weiAmount: order.weiAmount
    });
    await testHelper.assertEvent(tokenAce, "AugmintTransfer", {
        amount: order.amount,
        from: exchange.address,
        to: order.maker,
        fee: 0,
        narrative: "Sell token order cancelled"
    });

    const stateAfter = await getState();
    assert.equal(stateAfter.sellCount, stateBefore.sellCount, "sell order count shouldn't change");
    assert.equal(stateAfter.buyCount, stateBefore.buyCount - 1, "buy order count should be reduced by 1");
    await tokenAceTestHelper.assertBalances(balBefore, {
        exchange: { eth: balBefore.exchange.eth, ace: balBefore.exchange.ace - order.amount },
        maker: { eth: balBefore.maker.eth, ace: balBefore.maker.ace + order.amount, gasFee: CANCEL_SELL_MAXFEE }
    });

    return;
}

async function cancelSellEthOrder(testInstance, order) {
    const stateBefore = await getState();
    const balBefore = await tokenAceTestHelper.getAllBalances({ exchange: exchange.address, maker: order.maker });

    const tx = await exchange.cancelSellEthOrder(order.index, order.id, { from: order.maker });
    testHelper.logGasUse(testInstance, tx, "cancelSellEthOrder");
    await testHelper.assertEvent(exchange, "CancelledOrder", {
        orderId: order.id,
        maker: order.maker,
        tokenAmount: order.tokenAmount,
        weiAmount: order.weiAmount
    });

    const stateAfter = await getState();
    assert.equal(stateAfter.sellCount, stateBefore.sellCount - 1, "sell order count should be reduced by 1");
    assert.equal(stateAfter.buyCount, stateBefore.buyCount, "buy order count shouldn't change");

    await tokenAceTestHelper.assertBalances(balBefore, {
        exchange: { eth: balBefore.exchange.eth - order.amount, ace: balBefore.exchange.ace },
        maker: { eth: balBefore.maker.eth + order.amount, ace: balBefore.maker.ace, gasFee: CANCEL_SELL_MAXFEE }
    });
}

async function matchOrders(testInstance, sellOrder, buyOrder, marketRate) {
    // TODO:
    // const stateBefore = await getState();
    // const balBefore = await tokenAceTestHelper.getAllBalances({ exchange: exchange.address, maker: order.maker });
    //await printOrderBook();

    let expPrice;
    if (buyOrder.price >= 10000 && sellOrder.price <= 10000) {
        expPrice = 10000;
    } else {
        expPrice =
            Math.abs(buyOrder.price - 10000) > Math.abs(sellOrder.price - 10000) ? sellOrder.price : buyOrder.price;
    }

    const buyWeiValue = Math.round(buyOrder.amount / marketRate * ONEWEI / expPrice) * 10000;
    const sellTokenValue = Math.round(sellOrder.amount / ONEWEI * marketRate / expPrice * 10000);
    const tradedWeiAmount = Math.min(sellOrder.amount, buyWeiValue);
    const tradedTokenAmount = Math.min(buyOrder.amount, sellTokenValue);

    //if (expPrice !== 10000) {
    // if (sellOrder.id === 97 && buyOrder.id === 99) {
    //     console.log(await getSellOrder(sellOrder.index));
    //     console.log(await getBuyOrder(buyOrder.index));
    //
    //     console.log(
    //         ` Match to be executed:
    //     exchange balance: ${web3.fromWei(await web3.eth.getBalance(exchange.address)).toString()} ETH` +
    //             ` | ${(await tokenAce.balanceOf(exchange.address)) / 10000} ACE
    //     Sellorder amount: ${web3.fromWei(sellOrder.amount).toString()} ETH
    //     buy order amount: ${buyOrder.amount / 10000} ACE
    //           sell price: ${sellOrder.price / 10000}
    //            buy price: ${buyOrder.price / 10000}`
    //     );
    //
    //     console.log(`Match expected:
    //                 ETH/EUR rate: ${marketRate / 10000}
    //                ACE/EUR price: ${expPrice / 10000}
    //             Sellorder amount: ${web3.fromWei(sellOrder.amount).toString()} ETH
    //        sell order tokenValue: ${sellTokenValue / 10000} ACE
    //             buy order amount: ${buyOrder.amount / 10000} ACE
    //           buy order WeiValue: ${web3.fromWei(buyWeiValue).toString()} ETH
    //                  tradedToken: ${tradedTokenAmount / 10000} ACE
    //                    tradedWei: ${web3.fromWei(tradedWeiAmount).toString()} ETH`);
    // }

    const expMatch = {
        buyer: buyOrder.maker,
        seller: sellOrder.maker,
        price: expPrice,
        weiAmount: tradedWeiAmount,
        tokenAmount: tradedTokenAmount
    };

    const tx = await exchange.matchOrders(sellOrder.index, sellOrder.id, buyOrder.index, buyOrder.id);
    testHelper.logGasUse(testInstance, tx, "matchOrders");

    const ret = await testHelper.assertEvent(exchange, "OrderFill", {
        buyOrderId: x => Number.isInteger(x),
        sellOrderId: x => Number.isInteger(x),
        buyer: expMatch.buyer,
        seller: expMatch.seller,
        price: expMatch.price,
        weiAmount: expMatch.weiAmount,
        tokenAmount: expMatch.tokenAmount
    });
    /* TODO:
        Transfer(from: <indexed>, to: <indexed>, amount: 3799749)
        AugmintTransfer(from: <indexed>, to: <indexed>, amount: 3799749, narrative: Buy token order fill, fee: 0)
    */
    /* TODO:
    const stateAfter = await getState();
    assert.equal(stateAfter.sellCount, stateBefore.sellCount - 1, "sell order count should be reduced by 1");
    assert.equal(stateAfter.buyCount, stateBefore.buyCount, "buy order count shouldn't change");

    await tokenAceTestHelper.assertBalances(balBefore, {
        exchange: { eth: balBefore.exchange.eth - order.amount, ace: balBefore.exchange.ace },
        maker: { eth: balBefore.maker.eth + order.amount, ace: balBefore.maker.ace, gasFee: CANCEL_SELL_MAXFEE }
    });
    */
    return ret;
}

async function contractStateAsserts(expOrder) {
    const state = await getState();
    assert.equal(state.sellCount, expOrder.sellEthOrderCount, "sellEthOrderCount should be set");
    assert.equal(state.buyCount, expOrder.buyEthOrderCount, "buyEthOrderCount should be set");
    let order;
    if (expOrder.orderType === ETH_SELL) {
        order = await getSellOrder(expOrder.index);
    } else {
        order = await getBuyOrder(expOrder.index);
    }

    assert.equal(order.id, expOrder.id, "orderId should be set in contract's order array");
    assert.equal(order.maker, expOrder.maker, "maker should be the userAccount in contract's order array");
    // TODO: assert order.addedTime
    assert.equal(order.price, expOrder.price, "price should be set in contract's order array");
    assert.equal(order.amount, expOrder.amount, "amount should be set in contract's order array");
}

async function getState() {
    const ret = {};
    const orderCounts = await exchange.getOrderCounts();
    ret.sellCount = orderCounts[0].toNumber();
    ret.buyCount = orderCounts[1].toNumber();
    return ret;
}

async function getSellOrder(i) {
    const order = parseOrder(await exchange.sellEthOrders(i));
    order.weiAmount = order.amount;
    order.tokenAmount = 0;
    order.index = i;
    return order;
}

async function getBuyOrder(i) {
    const order = parseOrder(await exchange.buyEthOrders(i));
    order.weiAmount = 0;
    order.tokenAmount = order.amount;
    order.index = i;
    return order;
}

function parseOrder(order) {
    const ret = {
        id: order[0].toNumber(),
        maker: order[1],
        addedTime: order[2].toNumber(),
        price: order[3].toNumber(),
        amount: order[4].toNumber()
    };
    return ret;
}

async function printOrderBook(limit) {
    const orderCounts = await exchange.getOrderCounts();
    const sellCt = orderCounts[0].toNumber();
    const buyCt = orderCounts[1].toNumber();
    const marketRate = (await rates.rates("EUR"))[0].toNumber();
    let limitText;
    if (typeof limit === "undefined") {
        limit = sellCt > buyCt ? sellCt : buyCt;
        limitText = "(all orders)";
    } else {
        limitText = "(top " + limit + " orders)";
    }
    console.log(`========= Order Book  ${limitText} ETH/EUR: ${marketRate / 10000} =========
              Buy ct:  ${buyCt}    Sell ct:  ${sellCt}`);

    for (let i = 0; i < buyCt && i < limit; i++) {
        const order = await getBuyOrder(i);
        console.log(
            `BUY: ACE/EUR: ${order.price / 10000} amount: ${order.amount / 10000} ACE` +
                ` ${moment.unix(order.addedTime).format("HH:mm:ss")}` +
                ` orderIdx: ${i} orderId: ${order.id} acc: ${order.maker}`
        );
    }

    for (let i = 0; i < sellCt && i < limit; i++) {
        const order = await getSellOrder(i);
        console.log(
            `        SELL: ACE/EUR: ${order.price / 10000} amount: ${web3.fromWei(order.amount)} ETH` +
                ` ${moment.unix(order.addedTime).format("HH:mm:ss")}` +
                ` orderIdx: ${i} orderId: ${order.id} acc: ${order.maker}`
        );
    }

    console.log("=========/Order Book =========");
}
