/*
 Generic symbol / WEI rates contract.
 only callable by trusted price oracles.
 Being regularly called by a price oracle
    TODO: trustless/decentrilezed price Oracle
    TODO: shall we use blockNumber instead of now for lastUpdated?
    TODO: consider if we need storing rates with variable decimals instead of fixed 4
    TODO: could we emit 1 RateChanged event from setMultipleRates (symbols and newrates arrays)?
*/
pragma solidity 0.4.19;

import "./generic/SafeMath.sol";
import "./generic/Restricted.sol";


contract Rates is Restricted {
    using SafeMath for uint256;

    struct RateInfo {
        uint rate; // how much 1 WEI worth 1 unit , i.e. symbol/ETH rate
                    // 0 rate means no rate info available
        uint lastUpdated;
    }

    // mapping currency symbol => rate. all rates are stored with 4 decimals. i.e. ETH/EUR = 989.12 then rate = 989,1200
    mapping(bytes32 => RateInfo) public rates;

    event RateChanged(bytes32 symbol, uint newRate);

    function setRate(bytes32 symbol, uint newRate) external restrict("setRate") {
        rates[symbol] = RateInfo(newRate, now);
        RateChanged(symbol, newRate);
    }

    function setMultipleRates(bytes32[] symbols, uint[] newRates) external restrict("setRate") {
        require(symbols.length == newRates.length);
        for (uint256 i = 0; i < symbols.length; i++) {
            rates[symbols[i]] = RateInfo(newRates[i], now);
            RateChanged(symbols[i], newRates[i]);
        }
    }

    function convertFromWei(bytes32 bSymbol, uint weiValue) external view returns(uint value) {
        require(rates[bSymbol].rate > 0);
        return weiValue.mul(rates[bSymbol].rate).roundedDiv(1000000000000000000);
    }

    function convertToWei(bytes32 bSymbol, uint value) external view returns(uint weiValue) {
        // no require(rates[symbol].rate >  0) needed b/c it will revert with div by zero
        /* TODO: can we make this not loosing max scale? */
        return value.mul(1000000000000000000).roundedDiv(rates[bSymbol].rate);
    }

}
