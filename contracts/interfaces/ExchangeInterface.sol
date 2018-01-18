/* Interface for Augmint's internal Exchange
    TODO: rates setter?
    TODO: make a rates interface and use it instead?
    TODO: uint32 for now?
    TODO: do we need all funcs or just orders + placeBuyEthOrderTrusted  here?
*/
pragma solidity 0.4.18;
import "../generic/SafeMath.sol";
import "../generic/Restricted.sol";
import "./AugmintTokenInterface.sol";
import "../Rates.sol";


contract ExchangeInterface is Restricted {
    using SafeMath for uint256;
    AugmintTokenInterface public augmintToken;
    Rates public rates;
    uint public lastOrderId; // a unique id accross buy/sell orders to avoid potential issues referencing by only idx
                            // 0 means no order were placed yet

    struct Order {
        uint id;
        address maker;
        uint addedTime;
        uint price;
        uint amount; // SELL_ETH: amount in wei BUY_ETH: token amount with 4 decimals
    }

    Order[] public sellEthOrders;
    Order[] public buyEthOrders;

    function placeSellEthOrder(uint price) external payable returns (uint sellEthOrderIndex, uint orderId);
    function placeBuyEthOrder(uint price, uint tokenAmount) external returns (uint buyEthOrderIndex, uint orderId);

    function placeBuyEthOrderTrusted(address maker, uint price, uint tokenAmount)
        external returns (uint buyEthOrderIndex, uint orderId);

    function cancelBuyEthOrder(uint buyEtherOrderIndex, uint buyEthOrderId) external;
    function cancelSellEthOrder(uint sellEthOrderIndex, uint sellEthOrderId) external;

    function matchMultipleOrders(uint[] sellIndexes, uint[] sellIds, uint[] buyIndexes, uint[] buyIds)
        external returns(uint matchCount);

    function matchOrders(uint sellEthOrderIndex, uint sellEthOrderId, uint buyEthOrderIndex, uint buyEthOrderId)
        external;

}
