// mock implamentation of ETH/USD exchange rate oracle
// all usd values are with 4 decimals (paramaters and return values too)
pragma solidity ^0.4.11;

import "./Owned.sol";

contract Rates is owned {
    // 1 ETH = 1000000000000000000 WEI
    uint public usdWeiRate = 512820512821;  // ca. 1/195 ether ;
    uint8 public constant decimals = 4; // USD value decimal places
    uint32 public constant decimalMul = 10000;  // 10 ^ decimals;

    event e_usdWeiRateChanged(uint newWeiUsdRate);
    function setUsdWei(uint newUsdWeiRate) constant onlyOwner {
        usdWeiRate = newUsdWeiRate;
        e_usdWeiRateChanged(newUsdWeiRate);
        return;
    }

    function convertUsdToWei(uint usdValue) constant returns(uint weiValue) {
        // TODO: make it safe multiply
        return usdValue * usdWeiRate;
    }

    function convertWeiToUsd(uint weiValue) constant returns(uint usdValue) {
        // TODO: safe divide
        return weiValue / usdWeiRate ;
    }
}
