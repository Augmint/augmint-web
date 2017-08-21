var Exchange = artifacts.require("./Exchange.sol");
var Rates = artifacts.require("./Rates.sol");
var TokenUcd = artifacts.require("./TokenUcd.sol");
var BigNumber = require("bignumber.js");
var testHelper = new require("./helpers/testHelper.js");
var tokenUcdTestHelper = new require("./helpers/tokenUcdTestHelper.js");
var exchangeTestHelper = new require("./helpers/exchangeTestHelper.js");

const PLACE_ORDER_MAXFEE = web3.toWei(0.03);
const ETHSELL = 0,
    UCDSELL = 1;

let rates;

before(async function() {
    rates = await Rates.deployed();
});

contract("Exchange order", accounts => {
    it("no sell a sellEth order below min amount ");
    it("no sell a sellUcd order below min amount ");

    it("no sellEth order when user doesn't have enough ETH");
    it("no sellUcd order when user doesn't have enough UCD");

    it("take my own make order");

    it("place a sellEth order when no sellUcd orders", async function() {
        let orderType = ETHSELL;
        let orderAmount = web3.toWei(1);
        let maker = web3.eth.accounts[1];

        let tokenUcd = await tokenUcdTestHelper.newTokenUcd();
        let exchange = await exchangeTestHelper.newExchange(tokenUcd, rates);

        let makerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            maker
        );
        let exchBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            exchange.address
        );

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
                ucd: exchBalBefore.ucd,
                eth: exchBalBefore.eth.plus(orderAmount)
            },
            {
                name: "maker",
                address: maker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: makerBalBefore.ucd,
                eth: makerBalBefore.eth.minus(orderAmount)
            }
        ];

        await exchangeTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("place a sellUcd when no sellETH orders", async function() {
        let orderType = UCDSELL;
        let orderAmount = 500000;
        let maker = web3.eth.accounts[2];
        let tokenUcd = await tokenUcdTestHelper.newTokenUcd(orderAmount, maker);
        let exchange = await exchangeTestHelper.newExchange(tokenUcd, rates);

        let makerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            maker
        );
        let exchBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            exchange.address
        );

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
                ucd: exchBalBefore.ucd.plus(orderAmount),
                eth: exchBalBefore.eth
            },
            {
                name: "maker",
                address: maker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: makerBalBefore.ucd.minus(orderAmount),
                eth: makerBalBefore.eth
            }
        ];

        await exchangeTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellUcd - fully filled from bigger open sellEth order ", async function() {
        let taker = web3.eth.accounts[3];
        let maker = web3.eth.accounts[4];
        let sellUcdAmount = 500000;
        let sellEthAmount = web3.toWei(1);
        let tokenUcd = await tokenUcdTestHelper.newTokenUcd(
            sellUcdAmount,
            taker
        );
        let exchange = await exchangeTestHelper.newExchange(tokenUcd, rates);

        let orderType = ETHSELL;
        let tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx);

        let takerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            taker
        );
        let makerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            maker
        );
        let exchBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            exchange.address
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
            orderAmount: sellEthAmount - expEthSold,
            maker: maker,
            orderId: orderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ucd: exchBalBefore.ucd,
                eth: exchBalBefore.eth.minus(expEthSold)
            },
            {
                name: "maker",
                address: maker,
                ucd: makerBalBefore.ucd.plus(sellUcdAmount),
                eth: makerBalBefore.eth
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: takerBalBefore.ucd.minus(sellUcdAmount),
                eth: takerBalBefore.eth.plus(expEthSold)
            }
        ];

        await exchangeTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellUcd - exactly filled from multiple sellEth order");

    it("sellEth - fully filled from open sellUcd order ", async function() {
        let taker = web3.eth.accounts[5];
        let maker = web3.eth.accounts[6];
        let sellUcdAmount = 2000000;
        let sellEthAmount = web3.toWei(1);
        let tokenUcd = await tokenUcdTestHelper.newTokenUcd(
            sellUcdAmount,
            maker
        );
        let exchange = await exchangeTestHelper.newExchange(tokenUcd, rates);

        let orderType = UCDSELL;
        let tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: maker
        });

        testHelper.logGasUse(this, tx);

        let takerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            taker
        );
        let makerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            maker
        );
        let exchBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            exchange.address
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
                ucd: exchBalBefore.ucd.minus(expUcdSold),
                eth: exchBalBefore.eth
            },
            {
                name: "maker",
                address: maker,
                ucd: makerBalBefore.ucd,
                eth: makerBalBefore.eth.plus(sellEthAmount)
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: takerBalBefore.ucd.plus(expUcdSold),
                eth: takerBalBefore.eth.minus(sellEthAmount)
            }
        ];

        await exchangeTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellEth - exactly filled from multiple open sellUcd orders");

    it("sellUcd - partially filled from smaller open sellEth order ", async function() {
        let taker = web3.eth.accounts[7];
        let maker = web3.eth.accounts[8];
        let sellUcdAmount = 2550000;
        let sellEthAmount = web3.toWei(1);
        let tokenUcd = await tokenUcdTestHelper.newTokenUcd(
            sellUcdAmount,
            taker
        );
        let exchange = await exchangeTestHelper.newExchange(tokenUcd, rates);

        let orderType = ETHSELL;
        let tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: maker
        });
        testHelper.logGasUse(this, tx);

        let takerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            taker
        );
        let makerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            maker
        );
        let exchBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            exchange.address
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
                ucd: exchBalBefore.ucd,
                eth: exchBalBefore.eth.minus(expEthSold)
            },
            {
                name: "maker",
                address: maker,
                ucd: makerBalBefore.ucd.plus(sellUcdAmount),
                eth: makerBalBefore.eth
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: takerBalBefore.ucd.minus(sellUcdAmount),
                eth: takerBalBefore.eth.plus(expEthSold)
            }
        ];

        await exchangeTestHelper.balanceAsserts(tokenUcd, expBalances);
    });

    it("sellEth - partially filled from smaller open sellUcd order ", async function() {
        let taker = web3.eth.accounts[8];
        let maker = web3.eth.accounts[9];
        let sellUcdAmount = 1900000;
        let sellEthAmount = web3.toWei(1);
        let tokenUcd = await tokenUcdTestHelper.newTokenUcd(
            sellUcdAmount,
            maker
        );
        let exchange = await exchangeTestHelper.newExchange(tokenUcd, rates);

        let orderType = UCDSELL;
        let tx = await exchange.placeSellUcdOrder(sellUcdAmount, {
            from: maker
        });
        testHelper.logGasUse(this, tx);

        let takerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            taker
        );
        let makerBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            maker
        );
        let exchBalBefore = await exchangeTestHelper.getBalances(
            tokenUcd,
            exchange.address
        );

        orderType = ETHSELL;
        tx = await exchange.placeSellEthOrder({
            value: sellEthAmount,
            from: taker
        });
        testHelper.logGasUse(this, tx);

        let ethPaid = await rates.convertUsdcToWei(sellUcdAmount);
        let expUcdSold = sellUcdAmount;
        let ethLeft =
            sellEthAmount - (await rates.convertUsdcToWei(sellUcdAmount));
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
            orderAmount: ucdLeft,
            maker: taker,
            orderId: newOrderId
        });

        let expBalances = [
            {
                name: "exchange contract",
                address: exchange.address,
                ucd: exchBalBefore.ucd.minus(expUcdSold),
                eth: exchBalBefore.eth
            },
            {
                name: "maker",
                address: maker,
                ucd: makerBalBefore.ucd,
                eth: makerBalBefore.eth.plus(sellEthAmount)
            },

            {
                name: "taker",
                address: taker,
                gasFee: PLACE_ORDER_MAXFEE,
                ucd: takerBalBefore.ucd.plus(expUcdSold),
                eth: takerBalBefore.eth.minus(sellEthAmount)
            }
        ];

        await exchangeTestHelper.balanceAsserts(tokenUcd, expBalances);
    });
});
