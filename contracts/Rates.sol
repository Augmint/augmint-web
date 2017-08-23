/*  mock implamentation of ETH/USD exchange rate oracle
TODO: use of SafeMath
TODO: use a real oracle (eg. piggyback Oraclize pricing contract?)
*/
pragma solidity ^0.4.11;

import "./Owned.sol";
//import "./SafeMath.sol";

contract Rates is owned {
    //using SafeMath for uint256;

    uint constant ONE_ETH = 1000000000000000000; // 1 ETH in WEI

    // 1 USD = 10000 USDc
    uint8 public constant USD_DECIMALS = 4; // USD values decimal places
    uint32 public constant USD_SCALE = 10 ** 4;  // USDc to USD conversion, 10 ** USD_DECIMALS

    // TODO: remove this when connected to an Oracle
    uint public ethUsdcRate = 1950000   ;  //  1/195ETH = 512,820,512,821 WEI;

    function roundedDiv(uint a, uint b)  constant returns (uint256) {
        /* TODO: use SafeMath lib when https://github.com/ethereumjs/testrpc/issues/122  is fixed */
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 z = a / b;
        if ( a % b >= b / 2) {
            z++;  // no need for safe add b/c it can happen only if we divided the input
        }
        return z;
    }

    event e_ethToUsdcChanged(uint newEthUsdcRate);
    function ethToUsdc(uint newEthUsdcRate) onlyOwner {
        ethUsdcRate = newEthUsdcRate;
        e_ethToUsdcChanged(ethUsdcRate);
        return;
    }

    function convertWeiToUsdc(uint weiValue) constant returns(uint usdcValue) {
        // TODO: safe divide & multiply
        //return  (weiValue * ethUsdcRate).roundedDiv(ONE_ETH);
        return  roundedDiv( (weiValue * ethUsdcRate), ONE_ETH);
    }

    function convertUsdcToWei(uint usdcValue) constant returns(uint weiValue) {
        // TODO: safe divide & multiply
        // TODO: can we make this not loosing max scale?
        return  roundedDiv( ONE_ETH * usdcValue , ethUsdcRate  ) ;
    }
}
