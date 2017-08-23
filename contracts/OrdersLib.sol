pragma solidity ^0.4.11;

library OrdersLib {
    uint80 constant None = uint80(0);

    // this struct holds open sell and buy orders actual state
    // Ie. amount is updated when order partially filled
    struct OrderList {
        uint80 first;
        uint80 last;
        uint80 count;
        Order[] orders;
    }

    enum OrderType {EthSell, UcdSell}
    // all open orders
    struct OrderData {
        address maker;
        uint80 makerOrderIdx; // idx in map(maker => [])
        OrderType orderType;
        uint amount; // actual amount to sell left (WEI or UCDC depending on orderType)

    }

    struct Order  {
        uint80 prev;
        uint80 next;
        OrderData order;
    }

    /// Appends `_data` to the end of the list `self`.
    function append(OrderList storage self, OrderData _order) internal returns (uint80 index)  {
        index = uint80(self.orders.push(Order({prev: self.last, next: None, order: _order})));
        if (self.last == None)
        {
            assert (self.first == None && self.count == 0) ;
            self.first = self.last = index;
            self.count = 1;
        }
        else
        {
            self.orders[self.last - 1].next = index;
            self.last = index;
            self.count ++;
        }
        return index;
    }

    /// Removes the element identified by index
    /// `_index` from the list `self`.
    function remove(OrderList storage self, uint80 _index) internal {
        Order storage order = self.orders[_index - 1];
        if (self.count == 1) {
                self.count = 0;
                self.first = 0;
                self.last = 0;
                order.prev = 0;
                order.next = 0;
                return;
        }

        if (order.prev == None && order.next == None  ) {
            // this item is already deleted
            return;
        }
        if (order.prev == None)
            self.first = order.next;
        if (order.next == None)
            self.last = order.prev;
        if (order.prev != None)
            self.orders[order.prev - 1].next = order.next;
        if (order.next != None)
            self.orders[order.next - 1].prev = order.prev;
        self.count--;

    }

    // Iterator interface
    function iterateFirst(OrderList storage self) returns (uint80) { return self.first; }
    function iterateValid(OrderList storage self, uint80 _index) returns (bool) { return _index - 1 < self.orders.length; }
    function iteratePrev(OrderList storage self, uint80 _index) returns (uint80) { return self.orders[_index - 1].prev; }
    function iterateNext(OrderList storage self, uint80 _index) returns (uint80) { return self.orders[_index - 1].next; }
    // function iterateGet(OrderList storage self, uint80 _index) returns (Order) { return self.orders[_index - 1].order; }
}
