import React from "react";

import { Pblock } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupColumn as Col, MyGridTable } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/ToolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import CancelOrderButton from "./CancelOrderButton";

import { TOKEN_SELL, TOKEN_BUY } from "modules/reducers/orders";

const OrderItem = props => {
    const { order, userAccountAddress } = props;
    const ret = [
        <Col width={3} key={`${order.direction}-amount`}>
            {order.direction === TOKEN_SELL && <span>{order.amount} A€ </span>}
            {order.direction === TOKEN_BUY && <span>{order.amountRounded} ETH</span>}
        </Col>,
        <Col width={2} key={`${order.direction}-price`}>
            {order.price}
        </Col>,
        <Col width={2} key={`${order.direction}-action`}>
            <MoreInfoTip>
                {order.direction === TOKEN_SELL && (
                    <p>
                        Sell {order.amount} A-EUR @{order.price} A-EUR/ETH = {order.ethValue} ETH
                    </p>
                )}
                {order.direction === TOKEN_BUY && (
                    <p>
                        Buy A-EUR for {order.amount} ETH @{order.price} A-EUR/ETH = {order.tokenValue} A-EUR
                    </p>
                )}
                Maker: {order.maker}
                <br />Order Id: {order.id}
            </MoreInfoTip>
            {order.maker.toLowerCase() === userAccountAddress.toLowerCase() && <CancelOrderButton order={order} />}
        </Col>
    ];
    return ret;
};

const OrderList = props => {
    const { sellOrders, buyOrders, userAccountAddress } = props;

    const totalBuyAmount = parseFloat(buyOrders.reduce((sum, order) => order.bn_ethValue.add(sum), 0).toFixed(6));
    const totalSellAmount = sellOrders.reduce((sum, order) => order.tokenValue + sum, 0).toString();
    const listLen = Math.max(buyOrders.length, sellOrders.length);
    const itemList = [];

    for (let i = 0; i < listLen; i++) {
        itemList.push(
            <Row key={`ordersRow-${i}`}>
                {i < buyOrders.length ? (
                    <OrderItem order={buyOrders[i]} userAccountAddress={userAccountAddress} />
                ) : (
                    <Col width={7} />
                )}

                <Col width={1} />

                {i < sellOrders.length ? (
                    <OrderItem order={sellOrders[i]} userAccountAddress={userAccountAddress} />
                ) : (
                    <Col width={7} />
                )}
            </Row>
        );
    }

    return (
        <MyListGroup>
            <Row halign="center">
                <Col width={3} header="Buy A-EUR" style={{ textAlign: "center" }}>
                    {totalBuyAmount > 0 && <p>Total: {totalBuyAmount} ETH</p>}
                </Col>
                <Col width={1} />
                <Col width={3} header="Sell A-EUR" style={{ textAlign: "center" }}>
                    {totalSellAmount > 0 && <p>Total: {totalSellAmount} A-EUR</p>}
                </Col>
            </Row>
            <Row wrap={false} halign="center">
                <Col width={3}>
                    <strong>Amount</strong>
                </Col>
                <Col width={2}>
                    <strong>Price</strong> <PriceToolTip />
                </Col>
                <Col width={2} />
                <Col width={1} />
                <Col width={3}>
                    <strong>Amount</strong>
                </Col>
                <Col width={2}>
                    <strong>Price</strong> <PriceToolTip />
                </Col>
                <Col width={2} />
            </Row>
            {itemList}
        </MyListGroup>
    );
};

export default class OrderBook extends React.Component {
    render() {
        const { filter, header, userAccountAddress, testid } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        const buyOrders = orders == null ? [] : orders.buyOrders.filter(filter);
        const sellOrders = orders == null ? [] : orders.sellOrders.filter(filter);

        return (
            <Pblock loading={isLoading} header={header} data-testid={testid}>
                {refreshError && (
                    <ErrorPanel header="Error while fetching order list">{refreshError.message}</ErrorPanel>
                )}
                {orders == null && !isLoading && <p>Connecting...</p>}
                {isLoading ? (
                    <p>Refreshing orders...</p>
                ) : (
                    <MyGridTable>
                        <OrderList
                            buyOrders={buyOrders}
                            sellOrders={sellOrders}
                            userAccountAddress={userAccountAddress}
                        />
                    </MyGridTable>
                )}
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
