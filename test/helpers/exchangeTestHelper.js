const BigNumber = require("bignumber.js");
const moment = require("moment");
const testHelper = new require("./testHelper.js");
const tokenAceTestHelper = require("./tokenAceTestHelper.js");
const Exchange = artifacts.require("./Exchange.sol");

const ONEWEI = 1000000000000000000;
const PLACE_ORDER_MAXFEE = web3.toWei(0.03);
const CANCEL_SELL_MAXFEE = web3.toWei(0.03);
const MATCH_ORDER_MAXFEE = web3.toWei(0.03);
const TOKEN_BUY = 0;
const TOKEN_SELL = 1;

module.exports = {
    newExchangeMock,
    newOrder,
    cancelOrder,
    matchOrders,
    getState,
    getBuyTokenOrder,
    getSellTokenOrder,
    getOrders,
    printOrderBook
};

let exchange, tokenAce, rates;

async function newExchangeMock(_tokenAce, _rates, minOrderAmount) {
    tokenAce = _tokenAce;
    rates = _rates;
    exchange = await Exchange.new(tokenAce.address, rates.address, minOrderAmount);
    await exchange.grantMultiplePermissions(web3.eth.accounts[0], ["MonetaryBoard"]);
    await tokenAce.grantMultiplePermissions(exchange.address, ["ExchangeContracts", "NoFeeTransferContracts"]);
    return exchange;
}

async function newOrder(testInstance, order) {
    const stateBefore = await getState();
    const balBefore = await tokenAceTestHelper.getAllBalances({ exchange: exchange.address, maker: order.maker });
    order.amount = new BigNumber(order.amount); // to handle numbers, strings and BigNumbers passed
    order.viaAugmintToken =
        typeof order.viaAugmintToken === "undefined" && order.orderType === TOKEN_SELL ? true : order.viaAugmintToken;
    let tx;
    if (order.orderType === TOKEN_BUY) {
        tx = await exchange.placeBuyTokenOrder(order.price, {
            value: order.amount,
            from: order.maker
        });
        testHelper.logGasUse(testInstance, tx, "placeBuyTokenOrder");
        order.tokenAmount = 0;
        order.weiAmount = order.amount;
    } else {
        if (order.viaAugmintToken) {
            tx = await tokenAce.placeSellTokenOrderOnExchange(exchange.address, order.price, order.amount, {
                from: order.maker
            });
            testHelper.logGasUse(testInstance, tx, "tokenAce.placeSellTokenOrderOnExchange");
        } else {
            const approvedBefore = await tokenAce.allowed(order.maker, exchange.address);
            tx = await exchange.placeSellTokenOrder(order.price, order.amount, {
                from: order.maker
            });
            testHelper.logGasUse(testInstance, tx, "tokenAce.placeSellTokenOrderOnExchange");
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

    const eventResult = await newOrderEventAsserts(order);
    order.id = parseInt(eventResult.orderId);
    order.index = parseInt(eventResult.orderIndex);

    const state = await getState();

    let actualOrder, expBuyCount, expSellCount;
    if (order.orderType === TOKEN_BUY) {
        expBuyCount = stateBefore.buyCount + 1;
        expSellCount = stateBefore.sellCount;
        actualOrder = await getBuyTokenOrder(order.index);
    } else {
        expBuyCount = stateBefore.buyCount;
        expSellCount = stateBefore.sellCount + 1;
        actualOrder = await getSellTokenOrder(order.index);
    }

    assert.equal(state.buyCount, expBuyCount, "buyCount should be set");
    assert.equal(state.sellCount, expSellCount, "sellCount should be set");
    assert.equal(actualOrder.id, order.id, "orderId should be set in contract's order array");
    assert.equal(actualOrder.maker, order.maker, "maker should be the userAccount in contract's order array");
    // TODO: assert order.addedTime
    assert.equal(actualOrder.price, order.price, "price should be set in contract's order array");
    assert.equal(
        actualOrder.amount.toString(),
        order.amount.toString(),
        "amount should be set in contract's order array"
    );

    await tokenAceTestHelper.assertBalances(balBefore, {
        exchange: {
            eth: balBefore.exchange.eth.add(order.weiAmount),
            ace: balBefore.exchange.ace.add(order.tokenAmount)
        },
        maker: {
            eth: balBefore.maker.eth.sub(order.weiAmount),
            ace: balBefore.maker.ace.sub(order.tokenAmount),
            gasFee: PLACE_ORDER_MAXFEE
        }
    });
}

async function newOrderEventAsserts(order) {
    const res = await testHelper.assertEvent(exchange, "NewOrder", {
        orderIndex: x => x,
        orderId: x => x,
        maker: order.maker,
        price: order.price,
        weiAmount: order.weiAmount.toString(),
        tokenAmount: order.tokenAmount.toString()
    });

    if (order.orderType === TOKEN_SELL) {
        await testHelper.assertEvent(tokenAce, "Transfer", {
            from: order.maker,
            to: exchange.address,
            amount: order.tokenAmount.toString()
        });
        await testHelper.assertEvent(tokenAce, "AugmintTransfer", {
            from: order.maker,
            to: exchange.address,
            amount: order.tokenAmount.toString(),
            fee: 0,
            narrative: "Sell token order placed"
        });
    }
    return res;
}

async function cancelOrder(testInstance, order) {
    const stateBefore = await getState();
    const balBefore = await tokenAceTestHelper.getAllBalances({ exchange: exchange.address, maker: order.maker });

    if (order.orderType === TOKEN_SELL) {
        const tx = await exchange.cancelSellTokenOrder(order.index, order.id, { from: order.maker });
        testHelper.logGasUse(testInstance, tx, "cancelSellTokenOrder");
    } else {
        const tx = await exchange.cancelBuyTokenOrder(order.index, order.id, { from: order.maker });
        testHelper.logGasUse(testInstance, tx, "cancelBuyTokenOrder");
    }

    await testHelper.assertEvent(exchange, "CancelledOrder", {
        orderId: order.id,
        maker: order.maker,
        tokenAmount: order.tokenAmount.toString(),
        weiAmount: order.weiAmount.toString()
    });

    let expSellCount, expBuyCount;
    if (order.orderType === TOKEN_SELL) {
        await testHelper.assertEvent(tokenAce, "AugmintTransfer", {
            amount: order.amount.toString(),
            from: exchange.address,
            to: order.maker,
            fee: 0,
            narrative: "Sell token order cancelled"
        });
        expSellCount = stateBefore.sellCount - 1;
        expBuyCount = stateBefore.buyCount;
    } else {
        expSellCount = stateBefore.sellCount;
        expBuyCount = stateBefore.buyCount - 1;
    }

    const stateAfter = await getState();
    assert.equal(stateAfter.sellCount, expSellCount, "sell order count should be set");
    assert.equal(stateAfter.buyCount, expBuyCount, "buy order count should be set");
    await tokenAceTestHelper.assertBalances(balBefore, {
        exchange: {
            eth: balBefore.exchange.eth.sub(order.weiAmount),
            ace: balBefore.exchange.ace.sub(order.tokenAmount)
        },
        maker: {
            eth: balBefore.maker.eth.add(order.weiAmount),
            ace: balBefore.maker.ace.add(order.tokenAmount),
            gasFee: CANCEL_SELL_MAXFEE
        }
    });

    return;
}

async function matchOrders(testInstance, buyTokenOrder, sellTokenOrder, marketRate) {
    const stateBefore = await getState();
    const balancesBefore = await tokenAceTestHelper.getAllBalances({
        exchange: exchange.address,
        seller: sellTokenOrder.maker,
        buyer: buyTokenOrder.maker
    });
    //await printOrderBook();

    const matchCaller = web3.eth.accounts[0];
    let expPrice;
    if (sellTokenOrder.price <= 10000 && buyTokenOrder.price >= 10000) {
        expPrice = 10000;
    } else {
        expPrice =
            Math.abs(sellTokenOrder.price - 10000) > Math.abs(buyTokenOrder.price - 10000)
                ? buyTokenOrder.price
                : sellTokenOrder.price;
    }
    const sellWeiValue = Math.round(sellTokenOrder.amount * expPrice / 10000 / marketRate * ONEWEI / 10000) * 10000;
    const buyTokenValue = Math.round(buyTokenOrder.amount / ONEWEI * marketRate / expPrice * 10000);
    const tradedWeiAmount = Math.min(buyTokenOrder.amount, sellWeiValue);
    const tradedTokenAmount = Math.min(sellTokenOrder.amount, buyTokenValue);
    const buyFilled = buyTokenOrder.amount.eq(tradedWeiAmount);
    const sellFilled = sellTokenOrder.amount.eq(tradedTokenAmount);
    //if (expPrice !== 10000) {
    //    if (buyTokenOrder.id === 55 && sellTokenOrder.id === 80) {
    // console.log(await getBuyTokenOrder(buyTokenOrder.index));
    // console.log(await getSellTokenOrder(sellTokenOrder.index));
    // console.log(
    //     `*** Match to be executed:
    //     exchange balance: ${web3.fromWei(await web3.eth.getBalance(exchange.address)).toString()} ETH` +
    //         ` | ${(await tokenAce.balanceOf(exchange.address)) / 10000} ACE
    //     \tBUY\t\t   SELL
    //     amount:\t${web3.fromWei(buyTokenOrder.amount).toString()} ETH\t${sellTokenOrder.amount / 10000} ACE
    //     price:\t${buyTokenOrder.price / 10000}\t\t${sellTokenOrder.price / 10000}
    //     id:   \t${buyTokenOrder.id}\t\t${sellTokenOrder.id}` +
    //         `\n***`
    // );
    //
    // console.log(
    //     `*** Match expected on ETH/EUR rate: ${marketRate / 10000}
    //     \tBUY\t\t   SELL
    //     amount:\t${web3.fromWei(buyTokenOrder.amount).toString()} ETH\t${sellTokenOrder.amount / 10000} ACE
    //     price:\t${buyTokenOrder.price / 10000}\t\t${sellTokenOrder.price / 10000}
    //     value:\t${buyTokenValue / 10000} ACE\t${web3.fromWei(sellWeiValue).toString()} ETH
    //     id:   \t${buyTokenOrder.id}\t\t${sellTokenOrder.id}
    //     ---------------------------------------------
    //     ${buyFilled ? "Buy fully filled" : "Buy partially filled"}\t${
    //         sellFilled ? "Sell fully filled" : "Sell partially filled"
    //     }
    //         ACE/EUR price: ${expPrice / 10000}
    //         tradedToken:   ${tradedTokenAmount / 10000} ACE
    //         tradedETH:     ${web3.fromWei(tradedWeiAmount).toString()} ETH\n***`
    // );
    //}

    const expMatch = {
        sellTokenOrderId: sellTokenOrder.id,
        buyTokenOrderId: buyTokenOrder.id,
        tokenSeller: sellTokenOrder.maker,
        tokenBuyer: buyTokenOrder.maker,
        price: expPrice,
        weiAmount: tradedWeiAmount,
        tokenAmount: tradedTokenAmount,
        buyFilled: buyFilled,
        sellFilled: sellFilled,
        sellCount: sellFilled ? stateBefore.sellCount - 1 : stateBefore.sellCount,
        buyCount: buyFilled ? stateBefore.buyCount - 1 : stateBefore.buyCount
    };

    const tx = await exchange.matchOrders(
        buyTokenOrder.index,
        buyTokenOrder.id,
        sellTokenOrder.index,
        sellTokenOrder.id
    );
    testHelper.logGasUse(testInstance, tx, "matchOrders");

    await testHelper.assertEvent(exchange, "OrderFill", {
        sellTokenOrderId: expMatch.sellTokenOrderId,
        buyTokenOrderId: expMatch.buyTokenOrderId,
        tokenSeller: expMatch.tokenSeller,
        tokenBuyer: expMatch.tokenBuyer,
        price: expMatch.price,
        weiAmount: expMatch.weiAmount.toString(),
        tokenAmount: expMatch.tokenAmount.toString()
    });

    await testHelper.assertEvent(tokenAce, "Transfer", {
        from: exchange.address,
        to: expMatch.tokenBuyer,
        amount: expMatch.tokenAmount.toString()
    });
    await testHelper.assertEvent(tokenAce, "AugmintTransfer", {
        from: exchange.address,
        to: expMatch.tokenBuyer,
        amount: expMatch.tokenAmount.toString(),
        fee: 0,
        narrative: "Buy token order fill"
    });

    const stateAfter = await getState();
    assert.equal(stateAfter.sellCount, expMatch.sellCount, "sell order count should be as expected");
    assert.equal(stateAfter.buyCount, expMatch.buyCount, "buy order count should be as expected");

    await tokenAceTestHelper.assertBalances(balancesBefore, {
        exchange: {
            eth: balancesBefore.exchange.eth.sub(expMatch.weiAmount),
            ace: balancesBefore.exchange.ace.sub(expMatch.tokenAmount)
        }
    });
    if (balancesBefore.seller.address === balancesBefore.buyer.address) {
        await tokenAceTestHelper.assertBalances(balancesBefore, {
            seller: {
                eth: balancesBefore.seller.eth.add(expMatch.weiAmount),
                ace: balancesBefore.seller.ace.add(expMatch.tokenAmount),
                gasFee: matchCaller === sellTokenOrder.maker ? MATCH_ORDER_MAXFEE : 0
            }
        });
    } else {
        await tokenAceTestHelper.assertBalances(balancesBefore, {
            seller: {
                eth: balancesBefore.seller.eth.add(expMatch.weiAmount),
                ace: balancesBefore.seller.ace,
                gasFee: matchCaller === sellTokenOrder.maker ? MATCH_ORDER_MAXFEE : 0
            },
            buyer: {
                eth: balancesBefore.buyer.eth,
                ace: balancesBefore.buyer.ace.add(expMatch.tokenAmount),
                gasFee: matchCaller === buyTokenOrder.maker ? MATCH_ORDER_MAXFEE : 0
            }
        });
    }

    return expMatch;
}

async function getState() {
    const ret = {};
    const orderCounts = await exchange.getOrderCounts();
    ret.buyCount = orderCounts[0].toNumber();
    ret.sellCount = orderCounts[1].toNumber();
    return ret;
}

async function getBuyTokenOrder(i) {
    const order = parseOrder(await exchange.buyTokenOrders(i));
    order.weiAmount = order.amount;
    order.tokenAmount = 0;
    order.index = i;
    order.orderType = TOKEN_BUY;
    return order;
}

async function getSellTokenOrder(i) {
    const order = parseOrder(await exchange.sellTokenOrders(i));
    order.weiAmount = 0;
    order.tokenAmount = order.amount;
    order.index = i;
    order.orderType = TOKEN_SELL;
    return order;
}

function parseOrder(order) {
    const ret = {
        id: order[0].toNumber(),
        maker: order[1],
        addedTime: order[2].toNumber(),
        price: order[3].toNumber(),
        amount: order[4]
    };
    return ret;
}

async function getOrders(offset) {
    const result = await exchange.getOrders(offset);
    // result format: [maker] [id, addedTime, price, tokenAmount, weiAmount]
    return result[0].reduce(
        (res, order, idx) => {
            if (order[2].toString() !== "0") {
                const parsed = {
                    index: order[0].toNumber(),
                    id: order[1].toNumber(),
                    addedTime: order[2],
                    price: order[3].toNumber(),
                    tokenAmount: order[4],
                    weiAmount: order[5],
                    maker: result[1][idx]
                };
                if (parsed.weiAmount.toString() !== "0") {
                    parsed.amount = parsed.weiAmount;
                    parsed.orderType = TOKEN_BUY;
                    res.buyOrders.push(parsed);
                } else {
                    parsed.amount = parsed.tokenAmount;
                    parsed.orderType = TOKEN_SELL;
                    res.sellOrders.push(parsed);
                }
            }

            return res;
        },
        { buyOrders: [], sellOrders: [] }
    );
}

async function printOrderBook(_limit) {
    const state = await getState();
    const marketRate = (await rates.rates("EUR"))[0].toNumber();

    let limitText, limit;
    if (typeof _limit === "undefined") {
        limit = state.buyCount > state.sellCount ? state.buyCount : state.sellCount;
        limitText = "(all orders)";
    } else {
        limit = _limit;
        limitText = "(top " + _limit + " orders)";
    }

    console.log(`========= Order Book  ${limitText} ETH/EUR: ${marketRate / 10000} =========
              Sell token ct:  ${state.sellCount}    Buy token ct:  ${state.buyCount}`);

    for (let i = 0; i < state.sellCount && i < limit; i++) {
        const order = await getSellTokenOrder(i);
        console.log(
            `SELL token: ACE/EUR: ${order.price / 10000} amount: ${order.amount.toString() / 10000} ACE` +
                ` ${moment.unix(order.addedTime).format("HH:mm:ss")}` +
                ` orderIdx: ${i} orderId: ${order.id} acc: ${order.maker}`
        );
    }

    for (let i = 0; i < state.buyCount && i < limit; i++) {
        const order = await getBuyTokenOrder(i);
        console.log(
            `        BUY token: ACE/EUR: ${order.price / 10000} amount: ${web3.fromWei(order.amount)} ETH` +
                ` ${moment.unix(order.addedTime).format("HH:mm:ss")}` +
                ` orderIdx: ${i} orderId: ${order.id} acc: ${order.maker}`
        );
    }

    console.log("=========/Order Book =========");
}
