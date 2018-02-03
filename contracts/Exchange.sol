/* Augmint's internal Exchange
    TODO: finish matchMultipleOrders()
    TODO: check/test if underflow possible on sell/buyORder.amount -= token/weiAmount in matchOrders()
    TODO: deduct fee
    TODO: consider take funcs (frequent rate changes with takeBuyToken? send more and send back remainder?)
*/
pragma solidity 0.4.19;
import "./interfaces/ExchangeInterface.sol";


contract Exchange is ExchangeInterface {
    uint public minOrderAmount; // 0: no limit. For placeBuyTokenOrder it's calculated on current rate & price provided

    /* used to stop executing matchMultiple when running out of gas.
        actual is much less, just leaving enough matchMultipleOrders() to finish TODO: fine tune & test it*/
    uint32 public constant ORDER_MATCH_WORST_GAS = 200000;

    event NewOrder(uint orderIndex, uint indexed orderId, address indexed maker, uint price, uint tokenAmount,
        uint weiAmount);

    event OrderFill(address indexed tokenBuyer, address indexed tokenSeller, uint buyTokenOrderId,
        uint sellTokenOrderId, uint price, uint weiAmount, uint tokenAmount);

    event CancelledOrder(uint indexed orderId, address indexed maker, uint tokenAmount, uint weiAmount);

    event MinOrderAmountChanged(uint newMinOrderAmount);

    function Exchange(address augmintTokenAddress, address ratesAddress, uint _minOrderAmount) public {
        augmintToken = AugmintTokenInterface(augmintTokenAddress);
        rates = Rates(ratesAddress);
        minOrderAmount = _minOrderAmount;
    }

    function placeBuyTokenOrder(uint price) external payable returns (uint orderIndex, uint orderId) {
        require(price > 0);
        require(msg.value > 0);

        uint tokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(), msg.value.roundedDiv(price).mul(10000));
        require(tokenAmount >= minOrderAmount);

        lastOrderId++;
        orderIndex = buyTokenOrders.push(Order(lastOrderId, msg.sender, now, price, msg.value)) - 1;

        NewOrder(orderIndex, lastOrderId, msg.sender, price, 0, msg.value);
        return(orderIndex, lastOrderId);
    }

    /* this function requires previous approval to transfer tokens */
    function placeSellTokenOrder(uint price, uint tokenAmount) external returns (uint orderIndex, uint orderId) {
        augmintToken.transferFromNoFee(msg.sender, this, tokenAmount, "Sell token order placed");
        return _placeSellTokenOrder(msg.sender, price, tokenAmount);
    }

    /* This func assuming that token already transferred to Exchange so it can be only called
        via AugmintToken.placeSellTokenOrderOnExchange() convenience function */
    function placeSellTokenOrderTrusted(address maker, uint price, uint tokenAmount)
    external returns (uint orderIndex, uint orderId) {
        require(msg.sender == address(augmintToken));
        return _placeSellTokenOrder(maker, price, tokenAmount);
    }

    function cancelBuyTokenOrder(uint buyTokenIndex, uint buyTokenId) external {
        require(buyTokenOrders[buyTokenIndex].maker == msg.sender);
        require(buyTokenId == buyTokenOrders[buyTokenIndex].id);

        msg.sender.transfer(buyTokenOrders[buyTokenIndex].amount);

        CancelledOrder(buyTokenId, msg.sender, 0, buyTokenOrders[buyTokenIndex].amount);
        _removeOrder(buyTokenOrders, buyTokenIndex);
    }

    function cancelSellTokenOrder(uint sellTokenIndex, uint sellTokenId) external {
        require(sellTokenOrders[sellTokenIndex].maker == msg.sender);
        require(sellTokenId == sellTokenOrders[sellTokenIndex].id);

        augmintToken.transferNoFee(msg.sender, sellTokenOrders[sellTokenIndex].amount, "Sell token order cancelled");

        CancelledOrder(sellTokenId, msg.sender, sellTokenOrders[sellTokenIndex].amount, 0);
        _removeOrder(sellTokenOrders, sellTokenIndex);
    }

    /* matches any two orders if the sell price >= buy price
        trade price is the price which is closer to par.
        reverts if any of the orders been removed (i.e. passed orderId is not matching the orderIndex in contract)
    */
    function matchOrders(uint buyTokenIndex, uint buyTokenId, uint sellTokenIndex, uint sellTokenId) external {
        require(isValidMatch(buyTokenIndex, buyTokenId, sellTokenIndex, sellTokenId));

        var (buyFilled, sellFilled) = _fillOrder(buyTokenIndex, sellTokenIndex);
        if (sellFilled) { _removeOrder(sellTokenOrders, sellTokenIndex);}
        if (buyFilled) { _removeOrder(buyTokenOrders, buyTokenIndex); }
    }

    /*  matches as many orders as possible from the passed orders
        Runs as long as gas avialable for the call
        Returns the number of orders matched
        Stops if any match is invalid (case when any of the orders removed after client generated the match list sent)
        Reverts if sizes of arrays passed shorter than passed buyTokenIndexes.

        FIXME: finish this func */
    function matchMultipleOrders(uint[] buyTokenIndexes, uint[] buyTokenIds, uint[] sellTokenIndexes,
    uint[] sellTokenIds) external returns(uint i) {
        // fill but don't remove yet to keep indexes
        for (i = 0; i < buyTokenIndexes.length && msg.gas > ORDER_MATCH_WORST_GAS; i++) {
            /* stop processing next match is not valid but let the others pass */
            if (!isValidMatch(buyTokenIndexes[i], buyTokenIds[i], sellTokenIndexes[i], sellTokenIds[i])) { break; }

            var (buyFilled, sellFilled) = _fillOrder(buyTokenIndexes[i], sellTokenIndexes[i]);

            /* mark orders for removal - we can't remove yet as it would change indexes in buyTokenOrders storage array
                TODO: more gas effecient way? i.e. without writing storage */
            if (buyFilled) { buyTokenOrders[buyTokenIndexes[i]].amount = 0; }
            if (sellFilled) { sellTokenOrders[sellTokenIndexes[i]].amount = 0; }
        }

        /* FIXME: do removal
            potentially with a func optimised for multiple removals (instead of _removeOrder)
            TODO: fix gas cost left over calculation to count in removals gas cost */

        revert(); // function is not finished

        return i;
    }

    /* only allowed for Monetary Board. */
    function setMinOrderAmount(uint _minOrderAmount) external restrict("MonetaryBoard") {
        minOrderAmount = _minOrderAmount;
        MinOrderAmountChanged(minOrderAmount);
    }

    function getOrderCounts() external view returns(uint buyTokenOrderCount, uint sellTokenOrderCount) {
        return(buyTokenOrders.length, sellTokenOrders.length);
    }

    // returns 50 buy and sell token orders starting from some offset
    //      orders are encoded as [maker], [index, id, addedTime, price, tokenAmount, weiAmount]
    //      if weiAmount == 0 then SELL token order, if tokenAmount == 0 then BUY token order
    function getOrders(uint offset) external view returns (uint[6][50] response, address[50] makers) {
        Order memory order; // we should maybe use storage pointer here but that gives a warning

        uint sellOffset = buyTokenOrders.length < offset ? offset - buyTokenOrders.length : 0;

        for (uint8 i = 0; i < 50 && i + offset < buyTokenOrders.length; i++) {
            order = buyTokenOrders[offset + i];
            response[i] = [offset + i, order.id, order.addedTime, order.price, 0, order.amount];
            makers[i] = order.maker;
        }

        for (uint8 j = 0; j + i < 50 && sellOffset + j < sellTokenOrders.length; j++) {
            order = sellTokenOrders[sellOffset + j];
            response[i + j] = [sellOffset + j, order.id, order.addedTime, order.price,
                                order.amount, 0];
            makers[i + j] = order.maker;
        }

        return (response, makers);
    }

    function isValidMatch(uint buyTokenIndex, uint buyTokenId, uint sellTokenIndex, uint sellTokenId)
    public view returns (bool) {
        return (buyTokenId == buyTokenOrders[buyTokenIndex].id &&
                sellTokenId == sellTokenOrders[sellTokenIndex].id &&
                buyTokenOrders[buyTokenIndex].price >= sellTokenOrders[sellTokenIndex].price);
    }

    /* internal fill function, called by matchOrders and matchMultipleOrders.
        NB: it doesn't remove or check the match, calling function must do it */
    function _fillOrder(uint buyTokenIndex, uint sellTokenIndex) internal returns (bool buyFilled, bool sellFilled) {
        Order storage buyTokenOrder = buyTokenOrders[buyTokenIndex];
        Order storage sellTokenOrder = sellTokenOrders[sellTokenIndex];

        uint price = getMatchPrice(buyTokenOrder.price, sellTokenOrder.price); // use price which is closer to par
        uint sellTokenWeiAmount = rates.convertToWei(augmintToken.peggedSymbol(),
                                    sellTokenOrder.amount.mul(price)).roundedDiv(10000);
        uint tradedWeiAmount;
        uint tradedTokenAmount;

        if (sellTokenWeiAmount <= buyTokenOrder.amount) {
            tradedWeiAmount = sellTokenWeiAmount;
            tradedTokenAmount = sellTokenOrder.amount;
        } else {
            tradedWeiAmount = buyTokenOrder.amount;
            tradedTokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(),
                                                        buyTokenOrder.amount.roundedDiv(price).mul(10000));
        }

        sellFilled = tradedTokenAmount == sellTokenOrder.amount;
        buyFilled = tradedWeiAmount == buyTokenOrder.amount;

        if (!buyFilled) {
            buyTokenOrder.amount -= tradedWeiAmount;
        }
        if (!sellFilled) {
            sellTokenOrder.amount -= tradedTokenAmount;
        }

        sellTokenOrder.maker.transfer(tradedWeiAmount);
        augmintToken.transferNoFee(buyTokenOrder.maker, tradedTokenAmount, "Buy token order fill");

        OrderFill(buyTokenOrder.maker, sellTokenOrder.maker, buyTokenOrders[buyTokenIndex].id,
            sellTokenOrders[sellTokenIndex].id, price, tradedWeiAmount, tradedTokenAmount);
        return(buyFilled, sellFilled);
    }

    // return par if it's between par otherwise the price which is closer to par
    function getMatchPrice(uint buyPrice, uint sellPrice) internal pure returns(uint price) {
        if (sellPrice <= 10000 && buyPrice >= 10000) {
            price = 10000;
        } else {
            uint sellPriceDeviationFromPar = sellPrice > 10000 ? sellPrice - 10000 : 10000 - sellPrice;
            uint buyPriceDeviationFromPar = buyPrice > 10000 ? buyPrice - 10000 : 10000 - buyPrice;
            price = sellPriceDeviationFromPar > buyPriceDeviationFromPar ? buyPrice : sellPrice;
        }
        return price;
    }

    function _placeSellTokenOrder(address maker, uint price, uint tokenAmount)
    private returns (uint orderIndex, uint orderId) {
        require(price > 0);
        require(tokenAmount > 0);
        require(tokenAmount >= minOrderAmount);

        lastOrderId++;
        orderIndex = sellTokenOrders.push(Order(lastOrderId, maker, now, price, tokenAmount)) - 1;

        NewOrder(orderIndex, lastOrderId, maker, price, tokenAmount, 0);
        return(orderIndex, lastOrderId);
    }

    function _removeOrder(Order[] storage orders, uint orderIndex) private {
        if (orderIndex < orders.length - 1) {
            orders[orderIndex] = orders[orders.length - 1];
        }
        orders.length--;
    }

}
