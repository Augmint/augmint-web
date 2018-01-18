/* Augmint's internal Exchange
    TODO: finish matchMuiltipleOrders()
    TODO: check/test if underflow possible on sell/buyORder.amount -= token/weiAmount in matchOrders()
    TODO: use a lib for orders?
    TODO: use generic new order and remove order events? (and price sign would indicate buy/sell?
            or have both wei and tokenamounts?)
    TODO: deduct fee
    TODO: minOrderAmount setter
    TODO: index event args
    TODO: consider takeSell/BuyOrder funcs (frequent rate changes with takeBuyEth? send more and send back remainder?)
*/
pragma solidity 0.4.18;
import "./interfaces/ExchangeInterface.sol";


contract Exchange is ExchangeInterface {
    uint public minOrderAmount;
    /* used to stop executing matchMultiple when running out of gas.
        actual is much less, just leaving enough matchMultipleOrders() to finish TODO: fine tune & test it*/
    uint32 public constant ORDER_MATCH_WORST_GAS = 200000;

    event NewSellEthOrder(uint orderIndex, uint orderId, address maker, uint price, uint weiAmount);
    event NewBuyEthOrder(uint orderIndex, uint orderId, address maker, uint price, uint tokenAmount);

    event OrderFill(address seller, address buyer, uint buyOrderId, uint sellOrderId, uint price,
        uint weiAmount, uint tokenAmount);

    event CancelledSellEthOrder(uint orderId, address maker, uint weiAmount);
    event CancelledBuyEthOrder(uint orderId, address maker, uint tokenAmount);

    function Exchange(address augmintTokenAddress, address ratesAddress, uint _minOrderAmount) public {
        augmintToken = AugmintTokenInterface(augmintTokenAddress);
        rates = Rates(ratesAddress);
        minOrderAmount = _minOrderAmount;
    }

    function placeSellEthOrder(uint price) external payable returns (uint orderIndex, uint orderId) {
        require(price > 0);
        uint tokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(), msg.value);
        require(tokenAmount >= minOrderAmount);

        lastOrderId++;
        orderIndex = sellEthOrders.push(Order(lastOrderId, msg.sender, now, price, msg.value)) - 1;

        NewSellEthOrder(orderIndex, lastOrderId, msg.sender, price, msg.value);
        return(orderIndex, lastOrderId);
    }

    /* this function requires previous approval to transfer tokens */
    function placeBuyEthOrder(uint price, uint tokenAmount) external returns (uint orderIndex, uint orderId) {
        augmintToken.transferFromNoFee(msg.sender, this, tokenAmount, "Sell token order placed");
        return _placeBuyEthOrder(msg.sender, price, tokenAmount);
    }

    /* This func assuming that token already transferred to Exchange so it can be only called
        via AugmintToken.placeBuyEthOrderOnExchange() convenience function */
    function placeBuyEthOrderTrusted(address maker, uint price, uint tokenAmount)
    external returns (uint orderIndex, uint orderId) {
        require(msg.sender == address(augmintToken));
        return _placeBuyEthOrder(maker, price, tokenAmount);
    }

    function cancelSellEthOrder(uint sellIndex, uint sellId) external {
        require(sellEthOrders[sellIndex].maker == msg.sender);
        require(sellId == sellEthOrders[sellIndex].id);
        uint amount = sellEthOrders[sellIndex].amount;
        _removeOrder(sellEthOrders, sellIndex);
        CancelledSellEthOrder(sellId, msg.sender, amount);
    }

    function cancelBuyEthOrder(uint buyIndex, uint buyId) external {
        require(buyEthOrders[buyIndex].maker == msg.sender);
        require(buyId == buyEthOrders[buyIndex].id);
        uint amount = buyEthOrders[buyIndex].amount;
        _removeOrder(buyEthOrders, buyIndex);
        CancelledBuyEthOrder(buyId, msg.sender, amount);
    }

    /* matches any two orders if the sell price >= buy price
        trade price is the price which is closer to par.
        reverts if any of the orders been removed (i.e. passed orderId is not matching the orderIndex in contract)
    */
    function matchOrders(uint sellIndex, uint sellId, uint buyIndex, uint buyId) external {
        require(isValidMatch(sellIndex, sellId, buyIndex, buyId));

        var (sellFilled, buyFilled) = _fillOrder(sellIndex, buyIndex);
        if (buyFilled) { _removeOrder(buyEthOrders, buyIndex);}
        if (sellFilled) { _removeOrder(sellEthOrders, sellIndex); }
    }

    /*  matches as many orders as possible from the passed orders
        Runs as long as gas avialable for the call
        Returns the number of orders matched
        Stops if any match is invalid (case when any of the orders removed after client generated the match list sent)
        Reverts if sizes of arrays passed shorter than passed sellIndexes.
        */

    /* FIXME: finish this func */
    function matchMultipleOrders(uint[] sellIndexes, uint[] sellIds, uint[] buyIndexes, uint[] buyIds)
    external returns(uint i) {
        // fill but don't remove yet to keep indexes
        for (i = 0; i < sellIndexes.length && msg.gas > ORDER_MATCH_WORST_GAS; i++) {
            /* stop processing next match is not valid but let the others pass */
            if (!isValidMatch(sellIndexes[i], sellIds[i], buyIndexes[i], buyIds[i])) { break; }

            var (sellFilled, buyFilled) = _fillOrder(sellIndexes[i], buyIndexes[i]);

            /* mark orders for removal - we can't remove yet as it would change indexes in sellOrders storage array
                TODO: more gas effecient way? i.e. without writing storage */
            if (sellFilled) { sellEthOrders[sellIndexes[i]].amount = 0; }
            if (buyFilled) { buyEthOrders[buyIndexes[i]].amount = 0; }
        }

        /* FIXME: do removal
            potentially with a func optimised for multiple removals (instead of _removeOrder)
            TODO: fix gas cost left over calculation to count in removals gas cost */

        revert(); // function is not finished

        return i;
    }

    function isValidMatch(uint sellIndex, uint sellId, uint buyIndex, uint buyId) public view returns (bool) {
        return (sellId == sellEthOrders[sellIndex].id &&
                buyId == buyEthOrders[buyIndex].id &&
                sellEthOrders[sellIndex].price <= buyEthOrders[buyIndex].price);
    }

    function getOrderCounts() external view returns(uint sellEthOrderCount, uint buyEthOrderCount) {
        return(sellEthOrders.length, buyEthOrders.length);
    }

    /* internal fill function, called by matchOrders and matchMultipleOrders.
        NB: it doesn't remove or check the match, calling function must do it */
    function _fillOrder(uint sellIndex, uint buyIndex) internal returns (bool sellFilled, bool buyFilled) {
        Order storage sellOrder = sellEthOrders[sellIndex];
        Order storage buyOrder = buyEthOrders[buyIndex];

        uint price = getMatchPrice(sellOrder.price, buyOrder.price); // use price which is closer to par
        uint buyEthWeiAmount = rates.convertToWei(augmintToken.peggedSymbol(), buyOrder.amount).mul(price).div(10000);
        uint tradedWeiAmount;
        uint tradedTokenAmount;

        if (buyEthWeiAmount <= sellOrder.amount) {
            // fully filled buy order
            tradedWeiAmount = buyEthWeiAmount;
            if (buyEthWeiAmount == sellOrder.amount) {
                // sell order fully filled as well
                tradedTokenAmount = sellOrder.amount;
                sellFilled = true;
            } else {
                // sell order only partially filled
                tradedTokenAmount = buyOrder.amount;
                sellOrder.amount -= tradedWeiAmount;
            }
            buyFilled = true;
        } else {
            // partially filled buy order + fully filled sell order
            tradedWeiAmount = sellOrder.amount;
            tradedTokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(), sellOrder.amount)
                .mul(price).div(10000);
            buyOrder.amount -= tradedTokenAmount;
            sellFilled = true;
        }

        buyOrder.maker.transfer(tradedWeiAmount);
        augmintToken.transferNoFee(sellOrder.maker, tradedTokenAmount, "Buy token order fill");

        OrderFill(sellOrder.maker, buyOrder.maker, sellEthOrders[sellIndex].id, buyEthOrders[buyIndex].id, price,
            tradedWeiAmount, tradedTokenAmount);
        return(sellFilled, buyFilled);
    }

    // return the price which is closer to par
    function getMatchPrice(uint sellPrice, uint buyPrice) internal pure returns(uint price) {
        uint sellPriceDeviationFromPar = sellPrice > 1 ? sellPrice - 1 : 1 - sellPrice;
        uint buyPriceDeviationFromPar = buyPrice > 1 ? buyPrice - 1 : 1 - buyPrice;
        return price = sellPriceDeviationFromPar > buyPriceDeviationFromPar ?
            buyPrice : sellPrice;
    }

    function _placeBuyEthOrder(address maker, uint price, uint tokenAmount)
    private returns (uint orderIndex, uint orderId) {
        require(price > 0);
        require(tokenAmount >= minOrderAmount);

        lastOrderId++;
        orderIndex = buyEthOrders.push(Order(lastOrderId, maker, now, price, tokenAmount)) - 1;

        NewBuyEthOrder(orderIndex, lastOrderId, maker, price, tokenAmount);
        return(orderIndex, lastOrderId);
    }

    function _removeOrder(Order[] storage orders, uint orderIndex) private {
        if (orderIndex < orders.length - 1) {
            orders[orderIndex] = orders[orders.length - 1];
        }
        delete orders[orders.length - 1];
        orders.length--;
    }

}
