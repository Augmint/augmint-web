var Rates = artifacts.require("./Rates.sol");
require('babel-polyfill');

contract("Rates tests", accounts => {

    it('should be possible to set rates ', async function () {
        var instance = await Rates.new();
        assert.equal(0, 1, "to do");
    });

    it('should be possible to convert Wei to ETH');
    it('should be possible to convert ETH to WEI');
});
