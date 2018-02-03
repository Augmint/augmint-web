const Rates = artifacts.require("./Rates.sol");
const moment = require("moment");

module.exports = {
    newRatesMock,
    newRatesAsserts
};

let rates;

async function newRatesMock(symbol, rate) {
    rates = await Rates.new();
    await rates.grantPermission(web3.eth.accounts[0], "setRate");
    if (symbol) {
        await rates.setRate(symbol, rate);
    }

    return rates;
}

async function newRatesAsserts(tx, symbols, newRates) {
    const currentTime = moment()
        .utc()
        .unix();
    assert.equal(tx.logs.length, symbols.length, "setMultipleRates / setRate should be emmit RateChanged event(s)");
    for (let i = 0; i < symbols.length; i++) {
        assert.equal(tx.logs[i].event, "RateChanged", "RateChanged event should be emited for " + i + ". symbol");
        assert.equal(
            web3.toAscii(tx.logs[i].args.symbol).slice(0, symbols[i].length),
            symbols[i],
            "symbol " + i + ". should be set in RateChanged event"
        );
        assert.equal(
            tx.logs[i].args.newRate.toString(),
            newRates[i].toString(),
            "newRate " + i + ". should be set in RateChanged event"
        );
        const rateInfo = await rates.rates(symbols[i]);
        assert.equal(
            rateInfo[0].toString(),
            newRates[i].toString(),
            "new rate should be set for " + i + ". symbol in rates contract"
        );

        assert(currentTime >= rateInfo[1] - 2, "lastUpdated should be >= current time - 2 for " + i + ". symbol");
        assert(currentTime <= rateInfo[1] + 1, "lastUpdated should be <= current time + 1 for " + i + ". symbol");
    }
}
