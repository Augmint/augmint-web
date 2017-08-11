/*  mock implamentation of ETH/USD exchange rate oracle
TODO: use a real oracle (eg. piggyback Oraclize pricing contract?)
TODO: use save div and mul
TODO: implement convertUsdcToWei()
TODO: Consider using eg. Ray https://github.com/dapphub/ds-math

*/
pragma solidity ^0.4.11;

import "./Owned.sol";
import "./SafeMath.sol";

contract Rates is owned {
    using SafeMath for uint256;

    uint constant ONE_ETH = 1000000000000000000; // 1 ETH in WEI

    // 1 USD = 10000 USDc
    uint8 public constant USD_DECIMALS = 4; // USD values decimal places
    uint32 public constant USD_SCALE = 10 ** 4;  // USDc to USD conversion, 10 ** USD_DECIMALS

    // TODO: remove this when connected to an Oracle
    uint public ethUsdcRate = 1950000   ;  //  1/195ETH = 512,820,512,821 WEI;

    event e_ethToUsdcChanged(uint newEthUsdcRate);
    function ethToUsdc(uint newEthUsdcRate) onlyOwner {
        ethUsdcRate = newEthUsdcRate;
        e_ethToUsdcChanged(ethUsdcRate);
        return;
    }

    function convertWeiToUsdc(uint weiValue) constant returns(uint usdcValue) {
        // TODO: safe divide & multiply
        // rounded conversion
        return  (weiValue * ethUsdcRate).roundedDiv(ONE_ETH);
    }
}
