var Exchange = artifacts.require("./Exchange.sol");
var testHelper = new require("./testHelper.js");

module.exports = {
    newExchange,
    newOrderEventAsserts,
    orderFillEventAsserts,
    contractStateAsserts
};

function newExchange(tokenUcd, rates) {
    return new Promise(async function(resolve, reject) {
        let instance = await Exchange.new(tokenUcd.address, rates.address);
        await tokenUcd.setExchangeAddress(instance.address);
        resolve(instance);
    });
}

async function newOrderEventAsserts(logItem, orderType, maker, orderAmount) {
    assert.equal(
        logItem.event,
        "e_newOrder",
        "e_newOrder event should be emited"
    );
    let orderId = logItem.args.orderId.toNumber();
    assert.isNumber(orderId, "e_newOrder orderId should be set to a number");
    assert.equal(
        logItem.args.orderType.toNumber(),
        orderType,
        "e_newOrder orderType should be EthSell"
    );
    assert.equal(
        logItem.args.maker,
        maker,
        "e_newOrder maker should be the initiating userAccount"
    );
    assert.equal(
        logItem.args.amount.toString(),
        orderAmount.toString(),
        "e_newOrder amount should be the order value"
    );

    return orderId;
}

async function orderFillEventAsserts(
    logItem,
    taker,
    expAmountSold,
    expAmountPaid
) {
    assert.equal(
        logItem.event,
        "e_orderFill",
        "e_orderFill event should be emited"
    );
    let orderId = logItem.args.orderId.toNumber();
    assert.isNumber(orderId, "e_orderFill orderId should be set to a number");
    assert.equal(
        logItem.args.taker,
        taker,
        "e_orderFill taker should be the initiating userAccount"
    );

    assert.equal(
        logItem.args.amountSold.toString(),
        expAmountSold.toString(),
        "e_orderFill amountSold should be set"
    );
    assert.equal(
        logItem.args.amountPaid.toString(),
        expAmountPaid.toString(),
        "e_orderFill amountPaid should be set"
    );
    return orderId;
}

async function contractStateAsserts(exchange, expState) {
    let orderCount = (await exchange.getOrderCount()).toNumber();
    assert.equal(orderCount, expState.orderCount, "orderCount should be set");

    let order = await exchange.getOrder(expState.orderId);
    assert.equal(
        order[0],
        expState.maker,
        "maker should be the userAccount in contract's order array"
    );
    let makerOrderIdx = order[1].toNumber();
    assert.isNumber(
        makerOrderIdx,
        "makerOrderIdx should be a number in contract's order array"
    );
    assert.equal(
        order[2].toNumber(),
        expState.orderType,
        "orderType should be set in contract's order array"
    );
    assert.equal(
        order[3].toString(),
        expState.orderAmount.toString(),
        "amount should be set in contract's order array"
    );

    if (expState.amount > 0) {
        let orderId = (await exchange.getMakerOrder(
            expState.maker,
            makerOrderIdx
        ))[0].toNumber();
        assert.equal(
            orderId,
            expState.orderId,
            "orderId should be set in contract's m_orders mapping"
        );
    }
}
