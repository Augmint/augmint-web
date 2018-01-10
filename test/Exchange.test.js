const Rates = artifacts.require("./Rates.sol");
const BigNumber = require("bignumber.js");
const testHelper = new require("./helpers/testHelper.js");
const tokenAceTestHelper = require("./helpers/tokenAceTestHelper.js");
const exchangeTestHelper = require("./helpers/exchangeTestHelper.js");

const PLACE_ORDER_MAXFEE = web3.toWei(0.03);
const ETHSELL = 0,
    ACESELL = 1;

let snapshotId;
let rates, tokenAce, exchange, peggedSymbol;
let balBefore;
let maker = web3.eth.accounts[1],
    taker = web3.eth.accounts[2];
let testedAccounts;

/* TODO: refactor this spagetthi */
contract("Exchange order", accounts => {
    before(async function() {
        this.timeout(100000);
        rates = Rates.at(Rates.address);
        tokenAce = await tokenAceTestHelper.newTokenAceMock();
        peggedSymbol = web3.toAscii(await tokenAce.peggedSymbol());
        await tokenAce.issue(1000000000);
        await tokenAce.withdrawTokens(maker, 100000000);
        await tokenAce.withdrawTokens(taker, 100000000);

        exchange = await exchangeTestHelper.newExchange(tokenAce, rates);
        testedAccounts = [exchange.address, maker, taker];
    });

    beforeEach(async function() {
        this.timeout(50000);
        snapshotId = await testHelper.takeSnapshot();
        balBefore = await tokenAceTestHelper.getBalances(testedAccounts);
    });

    afterEach(async function() {
        await testHelper.revertSnapshot(snapshotId);
    });

    it("no sell a sellEth order below min amount ");
    it("no sell a sellAce order below min amount ");

    it("no sellEth order when user doesn't have enough ETH");
    it("no sellAce order when user doesn't have enough ACE");

    it("take my own make order");

    it("place a sellEth order when no sellAce orders", async function() {
        let orderType = ETHSELL;
        let orderAmount = web3.toWei(1);

        let tx = await exchange.placeSellEthOrder({
            value: orderAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx, "placeSellEthOrder");

        let orderId = await exchangeTestHelper.newOrderEventAsserts(tx.logs[0], orderType, maker, orderAmount);
        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: orderType,
            orderAmount: orderAmount,
            maker: maker,
            orderId: orderId
        });
        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ace: balBefore[0].ace,
                eth: balBefore[0].eth.plus(orderAmount)
            },
            {
                name: "maker",
                address: maker,
                gasFee: PLACE_ORDER_MAXFEE,
                ace: balBefore[1].ace,
                eth: balBefore[1].eth.minus(orderAmount)
            }
        ];

        await tokenAceTestHelper.balanceAsserts(expBalances);
    });

    it("place a sellAce when no sellETH orders", async function() {
        let orderType = ACESELL;
        let orderAmount = 500000;

        let tx = await exchange.placeSellTokenOrder(orderAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx, "placeSellTokenOrder");
        let orderId = await exchangeTestHelper.newOrderEventAsserts(tx.logs[0], orderType, maker, orderAmount);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: orderType,
            orderAmount: orderAmount,
            maker: maker,
            orderId: orderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ace: balBefore[0].ace.plus(orderAmount),
                eth: balBefore[0].eth
            },
            {
                name: "maker",
                address: maker,
                gasFee: PLACE_ORDER_MAXFEE,
                ace: balBefore[1].ace.minus(orderAmount),
                eth: balBefore[1].eth
            }
        ];

        await tokenAceTestHelper.balanceAsserts(expBalances);
    });

    it("sellAce - fully filled from bigger open sellEth order ", async function() {
        let sellAceAmount = 500000;
        let sellEthAmount = web3.toWei(1);

        let orderType = ETHSELL;
        let tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx, "placeSellEthOrder");

        balBefore = await tokenAceTestHelper.getBalances(testedAccounts);

        orderType = ACESELL;
        tx = await exchange.placeSellTokenOrder(sellAceAmount, {
            from: taker
        });
        testHelper.logGasUse(this, tx, "placeSellTokenOrder");
        const expEthSold = await rates.convertToWei(peggedSymbol, sellAceAmount);
        const orderId = await exchangeTestHelper.orderFillEventAsserts(tx.logs[0], taker, expEthSold, sellAceAmount);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: ETHSELL,
            orderAmount: new BigNumber(sellEthAmount).minus(expEthSold),
            maker: maker,
            orderId: orderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ace: balBefore[0].ace,
                eth: balBefore[0].eth.minus(expEthSold)
            },
            {
                name: "maker",
                address: maker,
                ace: balBefore[1].ace.plus(sellAceAmount),
                eth: balBefore[1].eth
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ace: balBefore[2].ace.minus(sellAceAmount),
                eth: balBefore[2].eth.plus(expEthSold)
            }
        ];

        await tokenAceTestHelper.balanceAsserts(expBalances);
    });

    it("sellAce - exactly filled from multiple sellEth order");

    it("sellEth - fully filled from open sellAce order ", async function() {
        const sellAceAmount = 20000000;
        const sellEthAmount = web3.toWei(1);

        let orderType = ACESELL;
        let tx = await exchange.placeSellTokenOrder(sellAceAmount, {
            from: maker
        });

        testHelper.logGasUse(this, tx, "placeSellTokenOrder");

        balBefore = await tokenAceTestHelper.getBalances(testedAccounts);

        orderType = ETHSELL;
        tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: taker
        });
        testHelper.logGasUse(this, tx, "placeSellEthOrder");

        const expAceSold = await rates.convertFromWei(peggedSymbol, sellEthAmount);
        const orderId = await exchangeTestHelper.orderFillEventAsserts(tx.logs[0], taker, expAceSold, sellEthAmount);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: ACESELL,
            orderAmount: sellAceAmount - expAceSold,
            maker: maker,
            orderId: orderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ace: balBefore[0].ace.minus(expAceSold),
                eth: balBefore[0].eth
            },
            {
                name: "maker",
                address: maker,
                ace: balBefore[1].ace,
                eth: balBefore[1].eth.plus(sellEthAmount)
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ace: balBefore[2].ace.plus(expAceSold),
                eth: balBefore[2].eth.minus(sellEthAmount)
            }
        ];

        await tokenAceTestHelper.balanceAsserts(expBalances);
    });

    it("sellEth - exactly filled from multiple open sellAce orders");

    it("sellAce - partially filled from smaller open sellEth order ", async function() {
        let sellAceAmount = 25500000;
        let sellEthAmount = web3.toWei(1);

        let orderType = ETHSELL;
        let tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx, "placeSellEthOrder");

        balBefore = await tokenAceTestHelper.getBalances(testedAccounts);

        orderType = ACESELL;
        tx = await exchange.placeSellTokenOrder(sellAceAmount, {
            from: taker
        });
        testHelper.logGasUse(this, tx, "placeSellTokenOrder");

        let acePaid = await rates.convertFromWei(peggedSymbol, sellEthAmount);
        let expEthSold = sellEthAmount;
        let aceLeft = sellAceAmount - (await rates.convertFromWei(peggedSymbol, sellEthAmount));

        let filledOrderId = await exchangeTestHelper.orderFillEventAsserts(tx.logs[0], taker, expEthSold, acePaid);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: ETHSELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId
        });

        let newOrderId = await exchangeTestHelper.newOrderEventAsserts(tx.logs[1], ACESELL, taker, aceLeft);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: ACESELL,
            orderAmount: aceLeft,
            maker: taker,
            orderId: newOrderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ace: balBefore[0].ace.plus(aceLeft),
                eth: balBefore[0].eth.minus(expEthSold)
            },
            {
                name: "maker",
                address: maker,
                ace: balBefore[1].ace.plus(sellAceAmount).minus(aceLeft),
                eth: balBefore[1].eth
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ace: balBefore[2].ace.minus(sellAceAmount),
                eth: balBefore[2].eth.plus(expEthSold)
            }
        ];

        await tokenAceTestHelper.balanceAsserts(expBalances);
    });

    it("sellEth - partially filled from smaller open sellAce order ", async function() {
        let sellAceAmount = 1900000;
        let sellEthAmount = web3.toWei(1);

        let orderType = ACESELL;
        let tx = await exchange.placeSellTokenOrder(sellAceAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx, "placeSellTokenOrder");

        balBefore = await tokenAceTestHelper.getBalances(testedAccounts);

        orderType = ETHSELL;
        tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: taker
        });
        testHelper.logGasUse(this, tx, "placeSellEthOrder");

        let ethPaid = await rates.convertToWei(peggedSymbol, sellAceAmount);
        let expAceSold = sellAceAmount;
        let ethLeft = new BigNumber(sellEthAmount).minus(await rates.convertToWei(peggedSymbol, sellAceAmount));

        let filledOrderId = await exchangeTestHelper.orderFillEventAsserts(tx.logs[0], taker, expAceSold, ethPaid);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: ACESELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId
        });

        let newOrderId = await exchangeTestHelper.newOrderEventAsserts(tx.logs[1], ETHSELL, taker, ethLeft);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 1,
            orderType: ETHSELL,
            orderAmount: ethLeft,
            maker: taker,
            orderId: newOrderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ace: balBefore[0].ace.minus(expAceSold),
                eth: balBefore[0].eth.plus(ethLeft)
            },
            {
                name: "maker",
                address: maker,
                ace: balBefore[1].ace,
                eth: balBefore[1].eth.plus(ethPaid)
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ace: balBefore[2].ace.plus(expAceSold),
                eth: balBefore[2].eth.minus(sellEthAmount)
            }
        ];

        await tokenAceTestHelper.balanceAsserts(expBalances);
    });

    it("sellEth - fully filled from multiple open sellAce orders", async function() {
        const sellEthAmount = web3.toWei(1);
        const sellAceAmount = (await rates.convertFromWei(peggedSymbol, sellEthAmount)).div(2);

        let orderType = ACESELL;
        let tx = await exchange.placeSellTokenOrder(sellAceAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx, "placeSellTokenOrder");

        tx = await exchange.placeSellTokenOrder(sellAceAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx, "placeSellTokenOrder");

        balBefore = await tokenAceTestHelper.getBalances(testedAccounts);

        orderType = ETHSELL;
        tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: taker
        });
        testHelper.logGasUse(this, tx, "placeSellEthOrder");

        let ethPaid = await rates.convertToWei(peggedSymbol, sellAceAmount);
        let expAceSold = sellAceAmount;
        let ethLeft = new BigNumber(sellEthAmount).minus(await rates.convertToWei(peggedSymbol, sellAceAmount * 2));

        let filledOrderId1 = await exchangeTestHelper.orderFillEventAsserts(tx.logs[0], taker, expAceSold, ethPaid);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 0,
            orderType: ACESELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId1
        });

        let filledOrderId2 = await exchangeTestHelper.orderFillEventAsserts(tx.logs[1], taker, expAceSold, ethPaid);

        await exchangeTestHelper.contractStateAsserts({
            orderCount: 0,
            orderType: ACESELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId2
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ace: balBefore[0].ace.minus(expAceSold * 2),
                eth: balBefore[0].eth.plus(ethLeft)
            },
            {
                name: "maker",
                address: maker,
                ace: balBefore[1].ace,
                eth: balBefore[1].eth.plus(ethPaid.times(2))
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ace: balBefore[2].ace.plus(expAceSold * 2),
                eth: balBefore[2].eth.minus(sellEthAmount)
            }
        ];

        await tokenAceTestHelper.balanceAsserts(expBalances);
    });
});
