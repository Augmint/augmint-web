/*
Exchange UCD <-> ETH
It's mock only yet, basic implemantion of selling UCD for ETH or vica versa.
All orders are on a market ethUCD rate at the moment of fullmilment
Market rate is provided  by the rates contract

TODO: add reentrancy protection
TODO: add min exchanged amount param (set in UCD for both?)
    + what if total leftover from fills  carried over to new order but it's small than minamount?
TODO: astronomical gas costs when filling a lot of orders
    + optimisation (eg. events emmmitted, transfers, what to store etc)
    + how to handle on client side (UX considerations)
TODO: make orders generic, ie. more generic placeSellOrder func.
TODO: test for rounding if could be any leftover after order fills
TODO: add option to fill or kill (ie option to not place orders if can't fill from open orders)
TODO: add option to pass a rate for fill or kill orders to avoid different rate if it changes while submitting - it would ensure trade happens on predictable rate
TODO: add narrative to UCD transfers
*/
pragma solidity ^0.4.11;
import "./Owned.sol";
import "./OrdersLib.sol";
import "./TokenUcd.sol";
import "./Rates.sol";

contract Exchange is owned {
    using OrdersLib for OrdersLib.OrderList;
    using OrdersLib for OrdersLib.OrderData;

    Rates public rates;
    TokenUcd public tokenUcd; // for UCD transfers

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

    mapping(address => uint80[]) public m_orders; // orders for an account

    function Exchange(address _tokenUcdAddress, address _ratesAddress) owned() {
         rates = Rates(_ratesAddress);
         tokenUcd = TokenUcd(_tokenUcdAddress);
    }

    function getMakerOrderCount(address maker) constant returns(uint orderCount) {
        return m_orders[maker].length;
    }

    function getOrderCount() constant returns(uint80 orderCount) {
        return orders.count;
    }

    function getMakerOrder(address maker, uint _makerOrderIdx) constant
            returns(uint orderId, uint makerOrderIdx, OrdersLib.OrderType orderType, uint amount)  {
        uint orderIdx = m_orders[maker][_makerOrderIdx];
        return (
                orders.orders[ orderIdx ].id,
                orders.orders[ orderIdx ].order.makerOrderIdx,
                orders.orders[ orderIdx ].order.orderType,
                orders.orders[ orderIdx ].order.amount);
    }

    function getOrderByOrderIndex (uint orderIdx) constant
            returns(address maker, uint orderId, uint makerOrderIdx, OrdersLib.OrderType orderType, uint amount) {
        return (orders.orders[ orderIdx ].order.maker,
                orders.orders[ orderIdx ].id,
                orders.orders[ orderIdx ].order.makerOrderIdx,
                orders.orders[ orderIdx ].order.orderType,
                orders.orders[ orderIdx ].order.amount);
    }

    function placeSellEthOrder() payable {
        require(msg.value > 0); // FIXME: min amount? Shall we use min UCD amount instead of ETH value?
        uint weiToSellLeft = msg.value;
        uint ucdValueTotal = rates.convertWeiToUsdc(weiToSellLeft);
        uint ucdValueLeft = ucdValueTotal;
        uint weiToPay;
        uint ucdSold;
        address maker;
        // fill as much as we can from open buy eth orders
        uint80 i;
        uint80 nextOrderIdx = orders.iterateFirst();
        while ( orders.iterateValid(nextOrderIdx) &&
                weiToSellLeft > 0 && // FIXME: minAmount to rounding acc?
                totalUcdSellOrders != 0 ) {
            i = nextOrderIdx;
            nextOrderIdx = orders.iterateNext(i);
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
            ucdValueLeft -= ucdSold;
            weiToSellLeft -= weiToPay;

            fillOrder(i, msg.sender, ucdSold, weiToPay); // this pays the maker but not the taker yet

        }
        // transfer the sum UCD value of all WEI sold with orderFills
        tokenUcd.transferExchange(this, msg.sender, ucdValueTotal - ucdValueLeft );
        if (weiToSellLeft != 0) {
            // No buy order or buy orders wasn't enough to fully fill order
            // ETH amount already on contract balance
            addOrder(OrdersLib.OrderType.EthSell, msg.sender,  weiToSellLeft);
        }
    }

    function placeSellUcdOrder(uint ucdAmount) {
        require(ucdAmount > 0); // FIXME: min amount?
        tokenUcd.transferExchange(msg.sender, this, ucdAmount);
        uint weiValueTotal = rates.convertUsdcToWei(ucdAmount);
        uint weiValueLeft = weiValueTotal;
        uint ucdToSellLeft = ucdAmount;
        uint weiSold;
        uint ucdToPay;
        address maker;
        // fill as much as we can from open buy ucd orders
        uint80 i;
        uint80 nextOrderIdx = orders.iterateFirst();
        while ( orders.iterateValid(nextOrderIdx) &&
                weiValueLeft > 0 && // FIXME: minAmount to rounding acc?
                totalEthSellOrders != 0 ) {
            i = nextOrderIdx;
            nextOrderIdx = orders.iterateNext(i);
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
            weiValueLeft -= weiSold;
            ucdToSellLeft -= ucdToPay;
            fillOrder(i, msg.sender, weiSold, ucdToPay); // this pays the maker but not the taker yet
        }
        // pay the sum WEI value of all UCD sold with orderFills to taker
        msg.sender.transfer( weiValueTotal - weiValueLeft );
        if (ucdToSellLeft != 0) {
            // No buy order or weren't enough buy orders to fully fill order
            addOrder(OrdersLib.OrderType.UcdSell, msg.sender, ucdToSellLeft);
        }
    }

    event e_newOrder(uint orderId, OrdersLib.OrderType orderType, address maker, uint amount);
    function addOrder(OrdersLib.OrderType orderType, address maker, uint amount) internal {
        // It's assumed that the ETH/UCD already taken from maker in calling function
        if (orderType == OrdersLib.OrderType.EthSell) {
            totalEthSellOrders += amount;
        } else if(orderType == OrdersLib.OrderType.UcdSell ){
            totalUcdSellOrders += amount;
        } else {
            revert();
        }

        uint80 newIndex = orders.append(OrdersLib.OrderData(maker, 0, orderType, amount)) -1;
        uint makerOrderIdx = m_orders[maker].push(newIndex);
        orders.orders[newIndex].order.makerOrderIdx = makerOrderIdx - 1;

        e_newOrder(orders.orders[newIndex].id, orderType, maker, amount );
        return;
    }

    event e_orderFill(uint orderId, OrdersLib.OrderType orderType, address maker, address taker, uint amountSold, uint amountPaid);
    function fillOrder(uint80 orderIdx, address taker, uint amountToSell, uint amountToPay) internal {
        // we only pay the maker here. Calling function must pay the sum of all buys to taker
        OrdersLib.OrderType orderType = orders.orders[orderIdx-1].order.orderType;
        address maker = orders.orders[orderIdx-1].order.maker;
        if (orderType == OrdersLib.OrderType.EthSell) {
            tokenUcd.transferExchange(this, maker, amountToPay);
            totalEthSellOrders -= amountToSell;
        } else if(orderType == OrdersLib.OrderType.UcdSell ){
            maker.transfer(amountToPay);
            totalUcdSellOrders -= amountToSell;
        } else {
            revert();
        }

        orders.orders[orderIdx-1].order.amount -= amountToSell;
        uint orderId = orders.orders[orderIdx-1].id;

        if (orders.orders[orderIdx-1].order.amount == 0) {
            removeOrder(orderIdx);
        }
        e_orderFill(orderId, orderType, maker, taker, amountToSell, amountToPay);
    }

    function removeOrder(uint80 orderIdx) internal {
        uint makerOrderIdx = orders.orders[orderIdx-1].order.makerOrderIdx;
        address maker = orders.orders[orderIdx-1].order.maker;
        orders.remove(orderIdx);
        uint len = m_orders[maker].length;
        if(makerOrderIdx == len -1 ) {
            // last item
            m_orders[maker].length--;
        } else {
            // not the last item, overwrite with last item and shrink array
            m_orders[maker][makerOrderIdx] = m_orders[maker][len -1];
            orders.orders[  m_orders[maker][len -1] ].order.makerOrderIdx = makerOrderIdx;
            m_orders[maker].length--;
        }
    }

    function cancelOrder(uint80 makerOrderIdx, uint orderId) {
        // FIXME: to implement
        // need both orderId to make sure we are cancelling the right one (ie. if order has been filled since getOrder)
        // transfer ETH or UCD back
         orderId = makerOrderIdx; // to supress compiler warnings
         // orderIdx = m_orders[msg.sender] ...
         // FIXME: check orderId
         // removeOrder( orderIdx)
    }

}
