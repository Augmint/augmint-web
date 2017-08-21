import React from "react";
import { Panel } from "react-bootstrap";
import { MyListGroup, MyListGroupItem } from "components/MyListGroups";

export default class OrderList extends React.Component {
    render() {
        const {
            filter,
            header,
            noItemMessage,
            userAccountAddress
        } = this.props;
        const { orders, error, isLoading } = this.props.orders;
        const listItems =
            orders != null &&
            orders.filter(filter).map((order, index) =>
                <MyListGroupItem key={`ordersDiv-${order.orderId}`}>
                    <p>
                        Maker: {order.maker}
                        {order.maker === userAccountAddress ? " Own" : ""}
                    </p>
                    <p>
                        Amount left: {order.amount} {order.ccy}
                    </p>
                    <small>
                        Order Id: {order.orderId} | makerOrderIdx:{" "}
                        {order.makerOrderIdx}
                    </small>
                </MyListGroupItem>
            );

        return (
            <Panel header={header}>
                {error && <p>Error loading orders</p>}
                {isLoading && <p>Refreshing order list...</p>}
                {orders != null && listItems.length === 0
                    ? noItemMessage
                    : <MyListGroup>
                          {listItems}
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
