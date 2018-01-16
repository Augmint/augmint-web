/* Interface for Augmint's internal Exchange
    TODO: rates setter?
    TODO: make a rates interface and use it instead?
    TODO: uint32 for now?
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

    struct Order {
        address maker;
        uint mapIdx; // index in mSellEthOrders or mBuyEthOrders
        uint addedTime;
        uint price;
        uint amount; // SELL_ETH: amount in wei BUY_ETH: token amount with 4 decimals
    }

    Order[] public sellEthOrders;
    Order[] public buyEthOrders;
    mapping(address => uint[]) public mSellEthOrders;
    mapping(address => uint[]) public mBuyEthOrders;

    function placeSellEthOrder(uint price) external payable returns (uint sellEthOrderId);
    function placeBuyEthOrder(uint price, uint tokenAmount) external returns (uint buyEthOrderId);

    function placeBuyEthOrderTrusted(address maker, uint price, uint tokenAmount) external returns (uint buyEthOrderId);

    function cancelBuyEthOrder(uint buyEthOrderId) external;
    function cancelSellEthOrder(uint sellEthOrderId) external;
    function matchOrders(uint sellEthOrderId, uint buyEthOrderId) external;
    function matchMultipleOrders(uint[] sellEthOrderIds, uint[] buyEthOrderIds) external;

}
