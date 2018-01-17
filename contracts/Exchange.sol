/* Augmint's internal Exchange
    TODO: check/test if underflow possible on sell/buyORder.amount -= token/weiAmount in matchOrders()
    TODO: use a lib for orders?
    TODO: use generic new order and remove order events? (and price sign would indicate buy/sell?
            or have both wei and tokenamounts?)
    TODO: deduct fee
    TODO: minOrderAmount setter
    TODO: index event args
*/
pragma solidity 0.4.18;
import "./interfaces/ExchangeInterface.sol";


contract Exchange is ExchangeInterface {
    uint public minOrderAmount;

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

    function matchOrders(uint sellIndex, uint sellId, uint buyIndex, uint buyId) external {
        Order storage sellOrder = sellEthOrders[sellIndex];
        Order storage buyOrder = buyEthOrders[buyIndex];
        require(sellOrder.price <= buyOrder.price);
        require(sellOrder.id == sellId);
        require(buyOrder.id == buyId);
        address sellMaker = sellOrder.maker;
        address buyMaker = buyOrder.maker;

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
                _removeOrder(sellEthOrders, sellIndex);
            } else {
                // sell order only partially filled
                tradedTokenAmount = buyOrder.amount;
                sellOrder.amount -= tradedWeiAmount;
            }
            _removeOrder(buyEthOrders, buyIndex);
        } else {
            // partially filled buy order + fully filled sell order
            tradedWeiAmount = sellOrder.amount;
            tradedTokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(), sellOrder.amount)
                .mul(price).div(10000);
            buyOrder.amount -= tradedTokenAmount;
            _removeOrder(sellEthOrders, sellIndex);
        }

        buyMaker.transfer(tradedWeiAmount);
        augmintToken.transferNoFee(sellMaker, tradedTokenAmount, "Buy token order fill");

        OrderFill(sellMaker, buyMaker, sellId, buyId, price, tradedWeiAmount,
            tradedTokenAmount);
    }

    /* Mathes [orderIndex, orderId] orders.
        Runs as long as gas avialable for the call
        Returns the number of orders matched
        Reverts if any match is invalid
        */
    function matchMultipleOrders(uint[2][] sellOrders, uint[2][] buyOrders) external returns(uint matchCount) {
        /* FIXME: to be implemented */
        matchCount = 0;
        require(sellOrders[0].length == buyOrders[0].length);
        require(sellOrders[1].length == buyOrders[1].length);
        require(sellOrders[0].length == sellOrders[1].length);
        require(buyOrders[0].length == buyOrders[1].length);
        revert();
    }

    function getOrderCounts() external view returns(uint sellEthOrderCount, uint buyEthOrderCount) {
        return(sellEthOrders.length, buyEthOrders.length);
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
