import React from "react";
//import { Button } from "semantic-ui-react";
import { Pblock } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupRowColumn as Col, MyGridTable } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/ToolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import { TOKEN_SELL } from "modules/reducers/orders";

const OrderList = props => {
    const { orders, userAccountAddress } = props;

    const itemList = orders.map(order => {
        return (
            <Row columns={3} key={`ordersRow-${order.orderType}-${order.id}`}>
                <Col>
                    {order.amount}
                    {order.orderType === TOKEN_SELL ? ` A-EUR` : ` ETH`}
                </Col>
                <Col>{order.price}</Col>
                <Col>
                    <p>
                        <MoreInfoTip>
                            Maker: {order.maker}
                            <br />Time: {order.addedTimeText}
                            <br />Order Id: {order.id} | index: {order.index}
                        </MoreInfoTip>
                        {order.maker.toLowerCase() === userAccountAddress.toLowerCase() && "Cancel order"}
                    </p>
                </Col>
            </Row>
        );
    });

    return orders.length === 0 ? (
        "No orders"
    ) : (
        <MyListGroup>
            <Row columns={3}>
                <Col>amount</Col>
                <Col>
                    price <PriceToolTip />
                </Col>
                <Col />
            </Row>
            {itemList}
        </MyListGroup>
    );
};

export default class OrderBook extends React.Component {
    render() {
        const { filter, header, userAccountAddress } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        const buyOrders = orders == null ? [] : orders.buyOrders.filter(filter);
        const sellOrders = orders == null ? [] : orders.sellOrders.filter(filter);

        const totalBuyAmount = isLoading ? "?" : buyOrders.reduce((sum, order) => order.amount + sum, 0).toString();
        const totalSellAmount = isLoading ? "?" : sellOrders.reduce((sum, order) => order.amount + sum, 0).toString();

        return (
            <Pblock loading={isLoading} header={header}>
                {refreshError && (
                    <ErrorPanel header="Error while fetching order list">{refreshError.message}</ErrorPanel>
                )}
                {orders == null && !isLoading && <p>Connecting...</p>}
                {isLoading && <p>Refreshing order list...</p>}

                <MyGridTable>
                    <MyGridTable.Row columns={2}>
                        <MyGridTable.Col header="Buy A-EUR">
                            {totalBuyAmount > 0 && <p>Total: {totalBuyAmount} ETH</p>}
                            <OrderList orders={buyOrders} userAccountAddress={userAccountAddress} />
                        </MyGridTable.Col>
                        <MyGridTable.Col header="Sell A-EUR">
                            {totalSellAmount > 0 && <p>Total: {totalSellAmount} A-EUR</p>}
                            <OrderList orders={sellOrders} userAccountAddress={userAccountAddress} />
                        </MyGridTable.Col>
                    </MyGridTable.Row>
                </MyGridTable>
            </Pblock>
        );
    }
}

OrderBook.defaultProps = {
    orders: null,
    userAccountAddress: null,
    filter: () => {
        return true; // no filter passed
    },
    header: <h3>Open orders</h3>
};
