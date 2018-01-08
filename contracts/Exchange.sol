/*
Exchange Acd <-> ETH
It's mock only yet, basic implemantion of selling Acd for ETH or vica versa.
All orders are on a market ethAcd rate at the moment of fullmilment
Market rate is provided  by the rates contract

TODO: add reentrancy protection
TODO: add min exchanged amount param (set in Acd for both?)
    + what if total leftover from fills  carried over to new order but it's small than minamount?
TODO: astronomical gas costs when filling a lot of orders
    + how to handle on client side (eg. estimate if it might be over the gas etc.)
TODO: make orders generic, ie. more generic placeSellOrder func.
TODO: test for rounding if could be any leftover after order fills
TODO: add option to fill or kill (ie option to not place orders if can't fill from open orders)
TODO: add option to pass a rate for fill or kill orders to avoid different rate if it changes while submitting - it would ensure trade happens on predictable rate
TODO: add orderId to Acd transfer narrative
*/
pragma solidity 0.4.18;
import "./generic/SafeMath.sol";
import "./generic/Owned.sol";
import "./generic/OrdersLib.sol";
import "./TokenAcd.sol";
import "./Rates.sol";

contract Exchange is Owned {
    using SafeMath for uint256;
    using OrdersLib for OrdersLib.OrderList;
    using OrdersLib for OrdersLib.OrderData;

    Rates public rates;
    TokenAcd public tokenUcd; // for UCD transfers

    // These should be equal to ETH and UCD Balances of contract
    /* TODO: consider to remove these when rounding tested */
    uint256 public totalUcdSellOrders;
    uint256 public totalEthSellOrders;

    /*
     orders stores all open orders. It's a linked array, ordered by the order was placed
     Order removed  when fully filled and updated when partially filled
     Note that it contains only one type of orders (EthSell or UtcSell) at any given time because all orders are on market rate
     Ie. it's not a real order book
    */
    OrdersLib.OrderList public orders;

    mapping(address => uint80[]) public m_orders; // orders for an account => orderId

    function Exchange(address _tokenUcdAddress, address _ratesAddress) public Owned() {
         rates = Rates(_ratesAddress);
         tokenUcd = TokenAcd(_tokenUcdAddress);
    }

    function getMakerOrderCount(address maker) external view returns(uint orderCount) {
        return m_orders[maker].length;
    }

    function getOrderCount() public view returns(uint80 orderCount) {
        return orders.count;
    }

    function getMakerOrder(address maker, uint80 _makerOrderIdx) external view
            returns(uint80 orderId, uint80 makerOrderIdx, OrdersLib.OrderType orderType, uint amount)  {
        orderId = m_orders[maker][_makerOrderIdx];
        return (
                orderId,
                orders.orders[ orderId -1].order.makerOrderIdx,
                orders.orders[ orderId -1].order.orderType,
                orders.orders[ orderId -1].order.amount);
    }

    function getOrder(uint80 orderId) external view
            returns(address maker,  uint80 makerOrderIdx, OrdersLib.OrderType orderType, uint amount) {
        return (orders.orders[ orderId -1 ].order.maker,
                orders.orders[ orderId -1 ].order.makerOrderIdx,
                orders.orders[ orderId -1 ].order.orderType,
                orders.orders[ orderId -1 ].order.amount);
    }

    /* Helper function for client to reduce web3 calls when getting orderlist
        Note: client should handle potential state changes in orders during iteration
        Returns:
            order data for orderId if order is open + next open orderId.
            Passing 0 orderId will return first open order
        Return values:
         order.amount 0 returned then orderId is not open
         nextOrderId 0 returned then no more open orders
         For invalid orderId returns 0 order.amount and nextOrderId
    */
    function iterateOpenOrders(uint80 orderId) external view
        returns (uint80 _orderId,
                address maker,
                uint80 makerOrderIdx,
                OrdersLib.OrderType orderType,
                uint amount,
                uint80 nextOrderId) {
        if( orders.first == 0) { // OrdersLib.None
            // no open orders
            return (0,address(0), 0,OrdersLib.OrderType.EthSell,0,0);
        }
        if(orderId == 0) {
            //|| orders.orders[orderid-1].first == OrdersLib.None) {
            _orderId = orders.first;
        } else {
            _orderId = orderId;
        }

        return (_orderId,
                orders.orders[ _orderId -1 ].order.maker,
                orders.orders[ _orderId -1 ].order.makerOrderIdx,
                orders.orders[ _orderId -1 ].order.orderType,
                orders.orders[ _orderId -1 ].order.amount,
                orders.orders[ _orderId -1 ].next);
    }


    function placeSellEthOrder() external payable {
        require(msg.value > 0); // FIXME: min amount? Shall we use min UCD amount instead of ETH value?
        uint weiToSellLeft = msg.value;
        uint ucdValueTotal = rates.convertWeiToUsdc(weiToSellLeft);
        uint ucdValueLeft = ucdValueTotal;
        uint weiToPay;
        uint ucdSold;
        address maker;
        // fill as much as we can from open buy eth orders
        uint80 i;
        uint80 nextOrderId = orders.iterateFirst();
        while ( orders.iterateValid(nextOrderId) &&
                weiToSellLeft > 0 && // FIXME: minAmount to rounding acc?
                totalUcdSellOrders != 0 ) {
            i = nextOrderId;
            nextOrderId = orders.iterateNext(i);
            maker = orders.orders[i-1].order.maker;
            if (orders.orders[i-1].order.amount >= ucdValueLeft) {
                // sell order fully covered from maker buy order
                ucdSold = ucdValueLeft ;
                weiToPay = weiToSellLeft;
            } else {
                // sell order partially covers buy order
                ucdSold = orders.orders[i-1].order.amount ;
                weiToPay = rates.convertUsdcToWei(ucdSold);
            }
            ucdValueLeft = ucdValueLeft.sub(ucdSold);
            weiToSellLeft = weiToSellLeft.sub(weiToPay);

            fillOrder(i, msg.sender, ucdSold, weiToPay); // this pays the maker but not the taker yet

        }
        if( ucdValueTotal.sub(ucdValueLeft) > 0 ) {
            // transfer the sum UCD value of all WEI sold with orderFills
            tokenUcd.transferNoFee(this, msg.sender, ucdValueTotal.sub(ucdValueLeft), "UCD sold");
        }
        if (weiToSellLeft != 0) {
            // No buy order or buy orders wasn't enough to fully fill order
            // ETH amount already on contract balance
            addOrder(OrdersLib.OrderType.EthSell, msg.sender,  weiToSellLeft);
        }
    }

    function placeSellUcdOrder(uint ucdAmount) external {
        require(ucdAmount > 0); // FIXME: min amount?
        tokenUcd.transferNoFee(msg.sender, this, ucdAmount, "UCD sell order placed" );
        uint weiValueTotal = rates.convertUsdcToWei(ucdAmount);
        uint weiValueLeft = weiValueTotal;
        uint ucdToSellLeft = ucdAmount;
        uint weiSold;
        uint ucdToPay;
        address maker;
        // fill as much as we can from open buy ucd orders
        uint80 i;
        uint80 nextOrderId = orders.iterateFirst();
        while ( orders.iterateValid(nextOrderId) &&
                weiValueLeft > 0 && // FIXME: minAmount to rounding acc?
                totalEthSellOrders != 0 ) {
            i = nextOrderId;
            nextOrderId = orders.iterateNext(i);
            maker = orders.orders[i-1].order.maker;
            if (orders.orders[i-1].order.amount >= weiValueLeft) {
                // sell order fully covered from maker buy order
                weiSold = weiValueLeft;
                ucdToPay = ucdToSellLeft;
           } else {
                // sell order partially covers buy order
                weiSold = orders.orders[i-1].order.amount;
                ucdToPay = rates.convertWeiToUsdc(weiSold);
            }
            weiValueLeft = weiValueLeft.sub(weiSold);
            ucdToSellLeft = ucdToSellLeft.sub(ucdToPay);
            fillOrder(i, msg.sender, weiSold, ucdToPay); // this pays the maker but not the taker yet
        }
        // pay the sum WEI value of all UCD sold with orderFills to taker
        msg.sender.transfer( weiValueTotal.sub(weiValueLeft));
        if (ucdToSellLeft != 0) {
            // No buy order or weren't enough buy orders to fully fill order
            addOrder(OrdersLib.OrderType.UcdSell, msg.sender, ucdToSellLeft);
        }
    }

    event e_newOrder(uint80 orderId, OrdersLib.OrderType orderType, address maker, uint amount);
    function addOrder(OrdersLib.OrderType orderType, address maker, uint amount) internal {
        // It's assumed that the ETH/UCD already taken from maker in calling function
        if (orderType == OrdersLib.OrderType.EthSell) {
            totalEthSellOrders = totalEthSellOrders.add(amount);
        } else if(orderType == OrdersLib.OrderType.UcdSell ){
            totalUcdSellOrders = totalUcdSellOrders.add(amount);
        } else {
            revert();
        }

        uint80 orderId = orders.append(OrdersLib.OrderData(maker, 0, orderType, amount));
        uint80 makerOrderIdx = uint80( m_orders[maker].push(orderId));
        orders.orders[orderId-1].order.makerOrderIdx = makerOrderIdx - 1;

        e_newOrder(orderId, orderType, maker, amount );
        return;
    }

    event e_orderFill(uint80 orderId, address taker, uint amountSold, uint amountPaid);
    function fillOrder(uint80 orderId, address taker,
            uint amountToSell, uint amountToPay) internal {
        // we only pay the maker here. Calling function must pay the sum of all buys to taker
        OrdersLib.OrderType orderType = orders.orders[orderId -1].order.orderType;
        address maker = orders.orders[orderId-1].order.maker;
        if (orderType == OrdersLib.OrderType.EthSell) {
            tokenUcd.transferNoFee(this, maker, amountToPay, "ETH sold");
            totalEthSellOrders = totalEthSellOrders.sub(amountToSell);
        } else if(orderType == OrdersLib.OrderType.UcdSell ){
            maker.transfer(amountToPay);
            totalUcdSellOrders = totalUcdSellOrders.sub(amountToSell);
        } else {
            revert();
        }

        orders.orders[orderId -1 ].order.amount = orders.orders[orderId -1 ].order.amount.sub(amountToSell);

        if (orders.orders[orderId -1].order.amount == 0) {
            removeOrder(orderId);
        }

        e_orderFill(orderId, taker, amountToSell, amountToPay);
    }

    function removeOrder(uint80 orderId) internal {
        uint80 makerOrderIdx = orders.orders[orderId-1].order.makerOrderIdx;
        address maker = orders.orders[orderId-1].order.maker;
        orders.remove(orderId);
        uint len = m_orders[maker].length;
        if(makerOrderIdx == len -1 ) {
            // last item
            m_orders[maker].length--;
        } else {
            // not the last item, overwrite with last item and shrink array
            m_orders[maker][makerOrderIdx] = m_orders[maker][len -1];
            orders.orders[  m_orders[maker][len -1] - 1 ].order.makerOrderIdx = makerOrderIdx;
            m_orders[maker].length--;
        }
    }
/*
    function cancelOrder( uint80 orderId ) external {
        // FIXME: to implement
        // transfer ETH or UCD back
         //orderId = orderId; // to supress compiler warnings
         // FIXME: check orderId
         // removeOrder( orderIdx)
    }
*/
}
