/* Augmint's internal Exchange
    TODO: check/test if underflow possible on sell/buyORder.amount -= token/weiAmount in matchOrders()
    TODO: use a lib for orders?
    TODO: use generic new order and remove order events?
    TODO: handle potential issues with using array idx as id. Generate an orderId and pass + cross check?
    TODO: deduct fee
    TODO: minOrderAmount setter
    TODO: index event args
*/
pragma solidity 0.4.18;
import "./interfaces/ExchangeInterface.sol";


contract Exchange is ExchangeInterface {
    uint public minOrderAmount;

    event NewSellEthOrder(uint sellEthOrderId, address maker, uint price, uint weiAmount);
    event NewBuyEthOrder(uint buyEthOrderId, address maker, uint price, uint tokenAmount);

    event OrderFill(address seller, address buyer, uint buyEthOrderId, uint sellEthOrderId, uint price,
        uint weiAmount, uint tokenAmount);

    event CancelledSellEthOrder(address maker, uint weiAmount);
    event CancelledBuyEthOrder(address maker, uint tokenAmount);

    function Exchange(address augmintTokenAddress, address ratesAddress, uint _minOrderAmount) public {
        augmintToken = AugmintTokenInterface(augmintTokenAddress);
        rates = Rates(ratesAddress);
        minOrderAmount = _minOrderAmount;
    }

    function placeSellEthOrder(uint price) external payable returns (uint sellEthOrderId) {
        require(price > 0);
        uint tokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(), msg.value);
        require(tokenAmount >= minOrderAmount);
        sellEthOrderId = sellEthOrders.length;
        uint mapIdx = mSellEthOrders[msg.sender].push(sellEthOrderId) - 1;
        sellEthOrders.push(
                Order(msg.sender, mapIdx, now, price, msg.value)
            ) - 1;

        NewSellEthOrder(sellEthOrderId, msg.sender, price, msg.value);
    }

    /* this function requires previous approval to transfer tokens */
    function placeBuyEthOrder(uint price, uint tokenAmount) external returns (uint buyEthOrderId) {
        augmintToken.transferFromNoFee(msg.sender, this, tokenAmount, "Sell token order placed");
        return _placeBuyEthOrder(msg.sender, price, tokenAmount);
    }

    /* This func assuming that token already transferred to Exchange so it can be only called
        via AugmintToken.placeBuyEthOrderOnExchange() convenience function */
    function placeBuyEthOrderTrusted(address maker, uint price, uint tokenAmount)
    external returns (uint buyEthOrderId) {
        require(msg.sender == address(augmintToken));
        return _placeBuyEthOrder(maker, price, tokenAmount);
    }

    function cancelSellEthOrder(uint sellEthOrderId) external {
        require(sellEthOrders[sellEthOrderId].maker == msg.sender);
        uint amount = sellEthOrders[sellEthOrderId].amount;
        removeItem(mSellEthOrders[msg.sender], sellEthOrders[sellEthOrderId].mapIdx);
        removeOrder(sellEthOrders, sellEthOrderId);
        CancelledSellEthOrder(msg.sender, amount);
    }

    function cancelBuyEthOrder(uint buyEthOrderId) external {
        require(buyEthOrders[buyEthOrderId].maker == msg.sender);
        uint amount = buyEthOrders[buyEthOrderId].amount;
        removeItem(mBuyEthOrders[msg.sender], buyEthOrders[buyEthOrderId].mapIdx);
        removeOrder(buyEthOrders, buyEthOrderId);
        CancelledBuyEthOrder(msg.sender, amount);
    }

    function matchOrders(uint sellId, uint buyId) external {
        Order storage sellOrder = sellEthOrders[sellId];
        Order storage buyOrder = buyEthOrders[buyId];
        require(sellOrder.price <= buyOrder.price);
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
                removeItem(mSellEthOrders[sellOrder.maker], sellOrder.mapIdx);
                removeOrder(sellEthOrders, sellId);
            } else {
                // sell order only partially filled
                tradedTokenAmount = buyOrder.amount;
                sellOrder.amount -= tradedWeiAmount;
            }
            removeItem(mBuyEthOrders[buyOrder.maker], buyOrder.mapIdx);
            removeOrder(buyEthOrders, buyId);
        } else {
            // partially filled buy order + fully filled sell order
            tradedWeiAmount = sellOrder.amount;
            tradedTokenAmount = rates.convertFromWei(augmintToken.peggedSymbol(), sellOrder.amount)
                .mul(price).div(10000);
            buyOrder.amount -= tradedTokenAmount;
            removeItem(mSellEthOrders[sellOrder.maker], sellOrder.mapIdx);
            removeOrder(sellEthOrders, sellId);
        }

        buyMaker.transfer(tradedWeiAmount);
        augmintToken.transferNoFee(sellMaker, tradedTokenAmount, "Buy token order fill");

        OrderFill(sellMaker, buyMaker, sellId, buyId, price, tradedWeiAmount,
            tradedTokenAmount);
    }

    function matchMultipleOrders(uint[] sellEthOrderIds, uint[] buyEthOrderIds) external {
        /* FIXME: to be implemented */
        require(sellEthOrderIds.length == buyEthOrderIds.length);
        revert();
    }

    function getOrderCounts() external view returns(uint sellEthOrderCount, uint buyEthOrderCount) {
        return(sellEthOrders.length, buyEthOrders.length);
    }

    function getAccountOrders(address maker) external view returns (uint[] sellEthOrderIds, uint[] buyEthOrderIds) {
        return (mSellEthOrders[maker], mBuyEthOrders[maker]);
    }

    // return the price which is closer to par
    function getMatchPrice(uint sellPrice, uint buyPrice) internal pure returns(uint price) {
        uint sellPriceDeviationFromPar = sellPrice > 1 ? sellPrice - 1 : 1 - sellPrice;
        uint buyPriceDeviationFromPar = buyPrice > 1 ? buyPrice - 1 : 1 - buyPrice;
        return price = sellPriceDeviationFromPar > buyPriceDeviationFromPar ?
            buyPrice : sellPrice;
    }

    function _placeBuyEthOrder(address maker, uint price, uint tokenAmount) private returns (uint buyEthOrderId) {
        require(price > 0);
        require(tokenAmount >= minOrderAmount);
        buyEthOrderId = buyEthOrders.length;
        uint mapIdx = mBuyEthOrders[maker].push(buyEthOrderId) - 1;
        buyEthOrders.push(
                Order(maker, mapIdx, now, price, tokenAmount)
            ) - 1;

        NewBuyEthOrder(buyEthOrderId, maker, price, tokenAmount);
    }

    function removeOrder(Order[] storage orders, uint pos) private {
        require(orders.length > 0);
        if (pos < orders.length - 1) {
            orders[pos] = orders[orders.length - 1];
        }
        delete orders[orders.length - 1];
        orders.length--;
    }

    function removeItem(uint[] storage arr, uint pos) private {
        require(arr.length > 0);
        if (pos < arr.length - 1) {
            arr[pos] = arr[arr.length - 1];
        }
        delete arr[arr.length - 1];
        arr.length--;
    }

}
