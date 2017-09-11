import React from "react";
import { Button } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";
import { MyListGroup } from "components/MyListGroups";
import ErrorDetails from "components/ErrorDetails";

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
        const { orders, refreshError, isLoading } = this.props.orders;
        const filteredOrders = orders == null ? null : orders.filter(filter);
        const listItems =
            filteredOrders != null &&
            filteredOrders.map((order, index) => (
                <MyListGroup.Row key={`ordersRow-${order.orderId}`}>
                    Sell {order.amount} {order.ccy} for{" "}
                    {order.ccy === "ETH" ? "UCD" : "ETH"}
                    <small>
                        <br />Order Id: {order.orderId} | makerOrderIdx:{" "}
                        {order.makerOrderIdx} | Maker: {order.maker}
                        {order.maker === userAccountAddress ? (
                            " TODO: Cancel my order"
                        ) : (
                            ""
                        )}
                    </small>
                </MyListGroup.Row>
            ));
        const totalAmount =
            filteredOrders === null
                ? "?"
                : filteredOrders
                      .reduce((sum, val) => val.bn_amount.plus(sum), 0)
                      .toString();
        let totalCcy;
        if (filteredOrders !== null && filteredOrders.length > 0)
            totalCcy = orders[0].ccy;
        let orderCount = orders === null ? "?" : filteredOrders.length;
        let ordersLabel =
            "Sell " +
            totalAmount +
            " " +
            totalCcy +
            " in " +
            orderCount +
            " orders";
        return (
            <Pblock header={header}>
                {refreshError && (
                    <p>
                        Error while fetching order list
                        <ErrorDetails>{refreshError.message}</ErrorDetails>
                    </p>
                )}
                {orders == null && !isLoading && <p>Connecting...</p>}
                {isLoading && <p>Refreshing order list...</p>}
                {orders != null &&
                !refreshError &&
                filteredOrders.length === 0 ? (
                    noItemMessage
                ) : (
                    <MyListGroup>
                        <Button
                            basic
                            content={ordersLabel}
                            labelPosition="left"
                            icon={
                                this.state.orderListOpen ? (
                                    "chevron up"
                                ) : (
                                    "chevron down"
                                )
                            }
                            onClick={() =>
                                this.setState({
                                    orderListOpen: !this.state.orderListOpen
                                })}
                        />
                        {this.state.orderListOpen && listItems}
                    </MyListGroup>
                )}
            </Pblock>
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
