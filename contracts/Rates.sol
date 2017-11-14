/*  mock implamentation of ETH/USD exchange rate oracle
    TODO: use a more realistic rates oracle (eg. piggyback Oraclize pricing contract?)
*/
pragma solidity ^0.4.11;

import "./SafeMath.sol";
import "./Owned.sol";

contract Rates is owned {
    using SafeMath for uint256;

    uint constant ONE_ETH = 1000000000000000000; // 1 ETH in WEI

    // 1 USD = 10000 ACDc
    uint8 public constant USD_DECIMALS = 4; // USD values decimal places
    uint32 public constant USD_SCALE = 10 ** 4;  // USDc to USD conversion, 10 ** USD_DECIMALS

    // TODO: remove this when connected to an Oracle
    uint public ethUsdcRate = 1950000   ;  //  1/195ETH = 512,820,512,821 WEI;

    event e_ethToUsdcChanged(uint newEthUsdcRate);
    function ethToUsdc(uint newEthUsdcRate) public onlyOwner {
        ethUsdcRate = newEthUsdcRate;
        e_ethToUsdcChanged(ethUsdcRate);
        return;
    }

    function convertWeiToUsdc(uint weiValue) external view returns(uint usdcValue) {
        return weiValue.mul(ethUsdcRate).roundedDiv(ONE_ETH);
    }

    function convertUsdcToWei(uint usdcValue) external view returns(uint weiValue) {
        // TODO: can we make this not loosing max scale?
        return ONE_ETH.mul(usdcValue).roundedDiv(ethUsdcRate) ;
    }
}
