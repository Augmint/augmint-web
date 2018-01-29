const ratesTestHelper = require("./helpers/ratesTestHelper");
const testHelper = require("./helpers/testHelper.js");

let rates;

contract("Rates tests", accounts => {
    before(async function() {
        rates = await ratesTestHelper.newRatesMock();
    });

    it("should be possible to set 1 rate", async function() {
        const symbol = "EUR";

        // change the symbol 1st time
        let tx = await rates.setRate(symbol, 12340000);
        testHelper.logGasUse(this, tx, "setRate 1st");
        await ratesTestHelper.newRatesAsserts(tx, [symbol], [12340000]);

        // change the same symbol again
        tx = await rates.setRate(symbol, 12350000);
        testHelper.logGasUse(this, tx, "setRate");
        await ratesTestHelper.newRatesAsserts(tx, [symbol], [12350000]);
    });

    it("should be possible to set multiple rates", async function() {
        const symbols = ["GBP", "USD"];
        let newRates = [12350000, 11110000];

        // change the symbols 1st time
        let tx = await rates.setMultipleRates(symbols, newRates);
        testHelper.logGasUse(this, tx, "setMultipleRates 2 1st");
        await ratesTestHelper.newRatesAsserts(tx, symbols, newRates);

        // change the symbols 2nd time
        newRates = [123460000, 11120000];
        tx = await rates.setMultipleRates(symbols, newRates);
        testHelper.logGasUse(this, tx, "setMultipleRates 2");
        await ratesTestHelper.newRatesAsserts(tx, symbols, newRates);
    });

    it("should be possible to convert WEI to/from EUR", async function() {
        const rate = 41592653;
        const testEur = 31415926536;

        await rates.setRate("EUR", rate);
        const ethValue = await rates.convertToWei("EUR", testEur);
        assert.equal(web3.fromWei(ethValue), testEur / rate, "ethValue converted should be correct");
        const eurValue = await rates.convertFromWei("EUR", ethValue);
        assert.equal(eurValue.toString(), web3.fromWei(ethValue) * rate, "eurValue converted should be correct");
        //console.log(web3.fromWei(ethValue).toString(), eurValue.toString());
    });

    it("setRate should allow to set 0 rate", async function() {
        let tx = await rates.setRate("XXX", 0);
        testHelper.logGasUse(this, tx, "setRate to 0 1st");
        await ratesTestHelper.newRatesAsserts(tx, ["XXX"], [0]);

        tx = await rates.setRate("XXX", 0);
        testHelper.logGasUse(this, tx, "setRate to 0");
        await ratesTestHelper.newRatesAsserts(tx, ["XXX"], [0]);
    });

    it("setMultipleRates should allow 0 rate set", async function() {
        let tx = await rates.setMultipleRates(["AAA", "BBB"], [0, 0]);
        testHelper.logGasUse(this, tx, "setMultipleRates 2 to 0 1st");
        await ratesTestHelper.newRatesAsserts(tx, ["AAA", "BBB"], [0, 0]);

        tx = await rates.setMultipleRates(["AAA", "BBB"], [0, 0]);
        testHelper.logGasUse(this, tx, "setMultipleRates 2 to 0");
        await ratesTestHelper.newRatesAsserts(tx, ["AAA", "BBB"], [0, 0]);
    });

    it("convert should throw when 0 rate set", async function() {
        await testHelper.expectThrow(rates.convertToWei("NOTSETYET", 1230000));
        await testHelper.expectThrow(rates.convertFromWei("NOTSETYET", 1230000));
        await rates.setRate("SETTOZERO", 0);
        await testHelper.expectThrow(rates.convertToWei("SETTOZERO", 1230000));
        await testHelper.expectThrow(rates.convertFromWei("SETTOZERO", 1230000));
    });
});
