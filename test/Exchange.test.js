const Rates = artifacts.require("./Rates.sol");
const Exchange = artifacts.require("./Exchange.sol");
const TokenUcd = artifacts.require("./TokenUcd.sol");
const BigNumber = require("bignumber.js");
const testHelper = new require("./helpers/testHelper.js");
const tokenUcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
const exchangeTestHelper = new require("./helpers/exchangeTestHelper.js");

const PLACE_ORDER_MAXFEE = web3.toWei(0.03);
const ETHSELL = 0,
    UCDSELL = 1;

let snapshotId;
let rates, tokenUcd, exchange;
let balBefore;
let maker = web3.eth.accounts[1],
    taker = web3.eth.accounts[2];
let testedAccounts;

before(async function() {
    this.timeout(100000);
    rates = await Rates.deployed();
    tokenUcd = await TokenUcd.deployed();
    await tokenUcd.issueUcd(1000000000);
    await tokenUcd.getUcdFromReserve(1000000000);

    await tokenUcd.transfer(maker, 100000000);
    await tokenUcd.transfer(taker, 100000000);
    exchange = await Exchange.deployed();
    testedAccounts = [exchange.address, maker, taker];
});

beforeEach(async function() {
    this.timeout(50000);
    snapshotId = await testHelper.takeSnapshot();
    balBefore = await tokenUcdTestHelper.getBalances(tokenUcd, testedAccounts);
});

afterEach(async function() {
    let res = await testHelper.revertSnapshot(snapshotId);
});

/* TODO: refactor this spagetthi */
contract("Exchange order", accounts => {
    it("no sell a sellEth order below min amount ");
    it("no sell a sellUcd order below min amount ");

    it("no sellEth order when user doesn't have enough ETH");
    it("no sellUcd order when user doesn't have enough UCD");

    it("take my own make order");

    it("place a sellEth order when no sellUcd orders", async function() {
        let orderType = ETHSELL;
        let orderAmount = web3.toWei(1);

        let tx = await exchange.placeSellEthOrder({
            value: orderAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx);

        let orderId = await exchangeTestHelper.newOrderEventAsserts(
            tx.logs[0],
            orderType,
            maker,
            orderAmount
        );
        await exchangeTestHelper.contractStateAsserts(exchange, {
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
                ucd: balBefore[0].ucd,
                eth: balBefore[0].eth.plus(orderAmount)
            },
            {
                name: "maker",
                address: maker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: balBefore[1].ucd,
                eth: balBefore[1].eth.minus(orderAmount)
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("place a sellUcd when no sellETH orders", async function() {
        let orderType = UCDSELL;
        let orderAmount = 500000;

        let tx = await exchange.placeSellUcdOrder(orderAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx);
        let orderId = await exchangeTestHelper.newOrderEventAsserts(
            tx.logs[0],
            orderType,
            maker,
            orderAmount
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
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
                ucd: balBefore[0].ucd.plus(orderAmount),
                eth: balBefore[0].eth
            },
            {
                name: "maker",
                address: maker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: balBefore[1].ucd.minus(orderAmount),
                eth: balBefore[1].eth
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellUcd - fully filled from bigger open sellEth order ", async function() {
        let sellUcdAmount = 500000;
        let sellEthAmount = web3.toWei(1);

        let orderType = ETHSELL;
        let tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx);

        balBefore = await tokenUcdTestHelper.getBalances(
            tokenUcd,
            testedAccounts
        );

        orderType = UCDSELL;
        tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: taker
        });
        testHelper.logGasUse(this, tx);

        let expEthSold = await rates.convertUsdcToWei(sellUcdAmount);
        let orderId = await exchangeTestHelper.orderFillEventAsserts(
            tx.logs[0],
            taker,
            expEthSold,
            sellUcdAmount
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
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
                ucd: balBefore[0].ucd,
                eth: balBefore[0].eth.minus(expEthSold)
            },
            {
                name: "maker",
                address: maker,
                ucd: balBefore[1].ucd.plus(sellUcdAmount),
                eth: balBefore[1].eth
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: balBefore[2].ucd.minus(sellUcdAmount),
                eth: balBefore[2].eth.plus(expEthSold)
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellUcd - exactly filled from multiple sellEth order");

    it("sellEth - fully filled from open sellUcd order ", async function() {
        let sellUcdAmount = 2000000;
        let sellEthAmount = web3.toWei(1);

        let orderType = UCDSELL;
        let tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: maker
        });

        testHelper.logGasUse(this, tx);

        balBefore = await tokenUcdTestHelper.getBalances(
            tokenUcd,
            testedAccounts
        );

        orderType = ETHSELL;
        tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: taker
        });
        testHelper.logGasUse(this, tx);

        let expUcdSold = await rates.convertWeiToUsdc(sellEthAmount);
        let orderId = await exchangeTestHelper.orderFillEventAsserts(
            tx.logs[0],
            taker,
            expUcdSold,
            sellEthAmount
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
            orderCount: 1,
            orderType: UCDSELL,
            orderAmount: sellUcdAmount - expUcdSold,
            maker: maker,
            orderId: orderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ucd: balBefore[0].ucd.minus(expUcdSold),
                eth: balBefore[0].eth
            },
            {
                name: "maker",
                address: maker,
                ucd: balBefore[1].ucd,
                eth: balBefore[1].eth.plus(sellEthAmount)
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: balBefore[2].ucd.plus(expUcdSold),
                eth: balBefore[2].eth.minus(sellEthAmount)
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellEth - exactly filled from multiple open sellUcd orders");

    it("sellUcd - partially filled from smaller open sellEth order ", async function() {
        let sellUcdAmount = 2550000;
        let sellEthAmount = web3.toWei(1);

        let orderType = ETHSELL;
        let tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx);

        balBefore = await tokenUcdTestHelper.getBalances(
            tokenUcd,
            testedAccounts
        );

        orderType = UCDSELL;
        tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: taker
        });
        testHelper.logGasUse(this, tx);

        let ucdPaid = await rates.convertWeiToUsdc(sellEthAmount);
        let expEthSold = sellEthAmount;
        let ucdLeft =
            sellUcdAmount - (await rates.convertWeiToUsdc(sellEthAmount));

        let filledOrderId = await exchangeTestHelper.orderFillEventAsserts(
            tx.logs[0],
            taker,
            expEthSold,
            ucdPaid
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
            orderCount: 1,
            orderType: ETHSELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId
        });

        let newOrderId = await exchangeTestHelper.newOrderEventAsserts(
            tx.logs[1],
            UCDSELL,
            taker,
            ucdLeft
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
            orderCount: 1,
            orderType: UCDSELL,
            orderAmount: ucdLeft,
            maker: taker,
            orderId: newOrderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ucd: balBefore[0].ucd.plus(ucdLeft),
                eth: balBefore[0].eth.minus(expEthSold)
            },
            {
                name: "maker",
                address: maker,
                ucd: balBefore[1].ucd.plus(sellUcdAmount).minus(ucdLeft),
                eth: balBefore[1].eth
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: balBefore[2].ucd.minus(sellUcdAmount),
                eth: balBefore[2].eth.plus(expEthSold)
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellEth - partially filled from smaller open sellUcd order ", async function() {
        let sellUcdAmount = 1900000;
        let sellEthAmount = web3.toWei(1);

        let orderType = UCDSELL;
        let tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx);

        balBefore = await tokenUcdTestHelper.getBalances(
            tokenUcd,
            testedAccounts
        );

        orderType = ETHSELL;
        tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: taker
        });
        testHelper.logGasUse(this, tx);

        let ethPaid = await rates.convertUsdcToWei(sellUcdAmount);
        let expUcdSold = sellUcdAmount;
        let ethLeft = new BigNumber(sellEthAmount).minus(
            await rates.convertUsdcToWei(sellUcdAmount)
        );

        let filledOrderId = await exchangeTestHelper.orderFillEventAsserts(
            tx.logs[0],
            taker,
            expUcdSold,
            ethPaid
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
            orderCount: 1,
            orderType: UCDSELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId
        });

        let newOrderId = await exchangeTestHelper.newOrderEventAsserts(
            tx.logs[1],
            ETHSELL,
            taker,
            ethLeft
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
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
                ucd: balBefore[0].ucd.minus(expUcdSold),
                eth: balBefore[0].eth.plus(ethLeft)
            },
            {
                name: "maker",
                address: maker,
                ucd: balBefore[1].ucd,
                eth: balBefore[1].eth.plus(ethPaid)
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: balBefore[2].ucd.plus(expUcdSold),
                eth: balBefore[2].eth.minus(sellEthAmount)
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellEth - fully filled from multiple open sellUcd orders", async function() {
        let sellUcdAmount = 200000;
        let sellEthAmount = web3.toWei(1);

        let orderType = UCDSELL;
        let tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx);

        tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx);

        balBefore = await tokenUcdTestHelper.getBalances(
            tokenUcd,
            testedAccounts
        );

        orderType = ETHSELL;
        tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: taker
        });
        testHelper.logGasUse(this, tx);

        let ethPaid = await rates.convertUsdcToWei(sellUcdAmount);
        let expUcdSold = sellUcdAmount;
        let ethLeft = new BigNumber(sellEthAmount).minus(
            await rates.convertUsdcToWei(sellUcdAmount * 2)
        );

        let filledOrderId1 = await exchangeTestHelper.orderFillEventAsserts(
            tx.logs[0],
            taker,
            expUcdSold,
            ethPaid
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
            orderCount: 1,
            orderType: UCDSELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId1
        });

        let filledOrderId2 = await exchangeTestHelper.orderFillEventAsserts(
            tx.logs[1],
            taker,
            expUcdSold,
            ethPaid
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
            orderCount: 1,
            orderType: UCDSELL,
            orderAmount: 0,
            maker: maker,
            orderId: filledOrderId2
        });

        let newOrderId = await exchangeTestHelper.newOrderEventAsserts(
            tx.logs[2],
            ETHSELL,
            taker,
            ethLeft
        );

        await exchangeTestHelper.contractStateAsserts(exchange, {
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
                ucd: balBefore[0].ucd.minus(expUcdSold * 2),
                eth: balBefore[0].eth.plus(ethLeft)
            },
            {
                name: "maker",
                address: maker,
                ucd: balBefore[1].ucd,
                eth: balBefore[1].eth.plus(ethPaid.times(2))
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: balBefore[2].ucd.plus(expUcdSold * 2),
                eth: balBefore[2].eth.minus(sellEthAmount)
            }
        ];

        await tokenUcdTestHelper.balanceAsserts(tokenUcd, expBalances);
    });
});
