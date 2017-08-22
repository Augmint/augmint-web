import React from "react";
import { Panel, Button } from "react-bootstrap";
import { MyListGroup, MyListGroupItem } from "components/MyListGroups";

export default class OrderList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            orderListOpen: false
        };
    }

    render() {
        const {
            filter,
            header,
            noItemMessage,
            userAccountAddress
        } = this.props;
        const { orders, error, isLoading } = this.props.orders;
        const filteredOrders = orders == null ? null : orders.filter(filter);
        const listItems =
            filteredOrders != null &&
            filteredOrders.map((order, index) =>
                <MyListGroupItem key={`ordersRow-${order.orderId}`}>
                    Sell {order.amount} {order.ccy} for{" "}
                    {order.ccy === "ETH" ? "UCD" : "ETH"}
                    <small>
                        <br />Order Id: {order.orderId} | makerOrderIdx:{" "}
                        {order.makerOrderIdx} | Maker: {order.maker}
                        {order.maker === userAccountAddress
                            ? " TODO: Cancel my order"
                            : ""}
                    </small>
                </MyListGroupItem>
            );
        const totalAmount =
            filteredOrders === null
                ? "?"
                : filteredOrders
                      .reduce((sum, val) => val.bn_amount.plus(sum), 0)
                      .toString();
        let totalCcy;
        if (filteredOrders !== null && filteredOrders.length > 0)
            totalCcy = orders[0].ccy;
        return (
            <Panel header={header}>
                {error && <p>Error loading orders</p>}
                {isLoading && <p>Refreshing order list...</p>}
                {orders != null && filteredOrders.length === 0
                    ? noItemMessage
                    : <MyListGroup>
                          Total: Sell {totalAmount} {totalCcy} in{" "}
                          {orders === null ? "?" : orders.length} orders
                          <Button
                              bsStyle="link"
                              onClick={() =>
                                  this.setState({
                                      orderListOpen: !this.state.orderListOpen
                                  })}
                          >
                              {this.state.orderListOpen
                                  ? "<< Hide orders"
                                  : "Show orders >>"}
                          </Button>
                          {this.state.orderListOpen && listItems}
                      </MyListGroup>}
            </Panel>
        );
    }
}

OrderList.defaultProps = {
    orders: null,
    userAccountAddress: null,
    filter: () => {
        return true; // no filter passed
    },
    noItemMessage: <p>No open orders</p>,
    header: <h3>Open orders</h3>
};
