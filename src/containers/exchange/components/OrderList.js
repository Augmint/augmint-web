import React from "react";
//import { Button } from "semantic-ui-react";
import { Pblock, Pgrid } from "components/PageLayout";
import { MyListGroup, MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";

const OrderItem = props => {
    const { order } = props;
    return (
        <MyListGroup.Row key={`ordersRow-${order.id}`}>
            Buy {`${order.amount} ACE sell order for ${order.price}`}
            <small>
                <br />Order Id: {order.id} | index: {order.index} | Maker: {order.maker}
                {order.maker.toLowerCase() === this.props.userAccountAddress.toLowerCase()
                    ? " TODO: Cancel my order"
                    : ""}
            </small>
        </MyListGroup.Row>
    );
};

export default class OrderList extends React.Component {
    render() {
        const { filter, header, noItemMessage } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        const buyOrders = orders == null ? [] : orders.buyOrders.filter(filter);
        const sellOrders = orders == null ? [] : orders.sellOrders.filter(filter);
        const buyItems = buyOrders.map((order, index) => <OrderItem order={buyOrders} />);
        const sellItems = buyOrders.map((order, index) => <OrderItem order={sellOrders} />);

        const totalBuyAmount = isLoading ? "?" : buyOrders.reduce((sum, val) => val.bn_amount.plus(sum), 0).toString();
        const totalSellAmount = isLoading
            ? "?"
            : sellOrders.reduce((sum, val) => val.bn_amount.plus(sum), 0).toString();

        return (
            <Pblock loading={isLoading} header={header}>
                {refreshError && (
                    <ErrorPanel header="Error while fetching order list">{refreshError.message}</ErrorPanel>
                )}
                {orders == null && !isLoading && <p>Connecting...</p>}
                {isLoading && <p>Refreshing order list...</p>}

                <MyGridTable>
                    <Row columns={2}>
                        <Col header="Buy ACE">
                            <p>Total: {totalBuyAmount} ETH</p>
                            {buyItems.length === 0 ? noItemMessage : <MyListGroup>{buyItems}</MyListGroup>}
                        </Col>
                        <Col header="Sell ACE">
                            <p>Total: {totalSellAmount} ACE</p>
                            {sellItems.length === 0 ? noItemMessage : <MyListGroup>{sellItems}</MyListGroup>}
                        </Col>
                    </Row>
                </MyGridTable>
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
