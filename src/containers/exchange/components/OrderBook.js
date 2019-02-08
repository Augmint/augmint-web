import React from "react";

import { Pblock } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupColumn as Col, MyGridTable } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/toolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import CancelOrderButton from "./CancelOrderButton";
import BigNumber from "bignumber.js";

import { TOKEN_SELL, TOKEN_BUY } from "modules/reducers/orders";
import { DECIMALS, DECIMALS_DIV } from "utils/constants";
import { floatNumberConverter } from "utils/converter";

const OrderItem = props => {
    const { order, ethFiatRate, userAccountAddress, rates } = props;
    const bn_ethFiatRate = new BigNumber(ethFiatRate);

    const displayPrice = floatNumberConverter(order.price, DECIMALS);

    function parsePrice(price) {
        return Math.round(price * 100) / 10000;
    }

    const actualValue =
        order.direction === TOKEN_SELL
            ? ((order.amount * order.price) / bn_ethFiatRate).toFixed(5)
            : ((bn_ethFiatRate / order.price) * order.amount).toFixed(2);

    const ret = [
        <Col width={3} key={`${order.direction}-amount`}>
            {order.direction === TOKEN_SELL && <span>{order.amount} A€</span>}
            {order.direction === TOKEN_BUY && (
                <span>
                    {order.amountRounded} ETH
                    {/* <br />{actualValue} A€ */}
                </span>
            )}
        </Col>,
        <Col width={3} key={`${order.direction}-est_amount`}>
            {order.direction === TOKEN_SELL && <span>{actualValue} ETH</span>}
            {order.direction === TOKEN_BUY && <span>{actualValue} A€</span>}
        </Col>,
        <Col width={2} key={`${order.direction}-price`}>
            {displayPrice} %
        </Col>,
        <Col width={2} key={`${order.direction}-rate`}>
            {(rates.info.ethFiatRate / parsePrice(displayPrice)).toFixed(2)} A€
        </Col>,
        <Col width={2} key={`${order.direction}-action`}>
            <MoreInfoTip id={"more_info-" + order.id}>
                {order.direction === TOKEN_SELL && (
                    <p>
                        Sell A€ order: <br />
                        {order.amount} A€ @{displayPrice}% of current ETH/€ = <br />
                        {order.amount} A€ * {order.price} €/A€ / {ethFiatRate} €/ETH = <br />
                        {actualValue} ETH
                    </p>
                )}
                {order.direction === TOKEN_BUY && (
                    <p>
                        Buy A€ Order: <br />
                        {order.amount} ETH @{displayPrice}% of current ETH/€ = <br />
                        {order.amount} ETH * {ethFiatRate} €/ETH / {order.price} €/A€ = <br />
                        {actualValue} A€
                    </p>
                )}
                Maker: {order.maker}
                <br />
                Order Id: {order.id}
            </MoreInfoTip>
            {order.maker.toLowerCase() === userAccountAddress.toLowerCase() && <CancelOrderButton order={order} />}
        </Col>
    ];
    return ret;
};

const OrderList = props => {
    const { sellOrders, buyOrders, userAccountAddress, ethFiatRate, rates } = props;

    const totalBuyAmount = parseFloat(buyOrders.reduce((sum, order) => order.bn_ethValue.add(sum), 0).toFixed(6));
    const totalSellAmount = new BigNumber(sellOrders.reduce((sum, order) => order.bn_amount.add(sum), 0))
        .div(DECIMALS_DIV)
        .toFixed(2);
    const listLen = Math.max(buyOrders.length, sellOrders.length);
    const itemList = [];

    for (let i = 0; i < listLen; i++) {
        itemList.push(
            <Row key={`ordersRow-${i}`} valign="top">
                {i < buyOrders.length ? (
                    <OrderItem
                        order={buyOrders[i]}
                        ethFiatRate={ethFiatRate}
                        userAccountAddress={userAccountAddress}
                        rates={rates}
                    />
                ) : (
                    <Col width={7} />
                )}

                <Col width={1} />

                {i < sellOrders.length ? (
                    <OrderItem
                        order={sellOrders[i]}
                        ethFiatRate={ethFiatRate}
                        userAccountAddress={userAccountAddress}
                        rates={rates}
                    />
                ) : (
                    <Col width={7} />
                )}
            </Row>
        );
    }

    return (
        <MyListGroup>
            <Row halign="center" valign="top">
                <Col width={3} header="A-EUR Buyers" style={{ textAlign: "center" }}>
                    {totalBuyAmount > 0 && <p>Total: {totalBuyAmount} ETH</p>}
                </Col>
                <Col width={1} />
                <Col width={3} header="A-EUR Sellers" style={{ textAlign: "center" }}>
                    {totalSellAmount > 0 && <p>Total: {totalSellAmount} A-EUR</p>}
                </Col>
            </Row>
            <Row wrap={false} halign="center" valign="top">
                <Col width={3}>
                    <strong>ETH amount</strong>
                </Col>
                <Col width={3}>
                    <strong>Est. A-EUR amount</strong>
                </Col>
                <Col width={2}>
                    <strong>Price</strong> <PriceToolTip id={"price_buy"} />
                </Col>
                <Col width={2}>
                    <strong>Est. ETH/EUR rate</strong> <PriceToolTip id={"rate_buy"} />
                </Col>
                <Col width={2} />
                <Col width={1} />
                <Col width={3}>
                    <strong>A-EUR amount</strong>
                </Col>
                <Col width={3}>
                    <strong>Est. ETH amount</strong>
                </Col>
                <Col width={2}>
                    <strong>Price</strong> <PriceToolTip id={"price_sell"} />
                </Col>
                <Col width={2}>
                    <strong>Est. ETH/EUR rate</strong> <PriceToolTip id={"rate_sell"} />
                </Col>
                <Col width={2} />
            </Row>
            {itemList}
        </MyListGroup>
    );
};

export default class OrderBook extends React.Component {
    render() {
        const { filter, header, userAccountAddress, testid, rates } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        const buyOrders = orders == null ? [] : orders.buyOrders.filter(filter);
        const sellOrders = orders == null ? [] : orders.sellOrders.filter(filter);
        const { ethFiatRate } = this.props.rates.info;
        //const { ethFiatRate } = this.props.rates ? rates.info : "?";

        // console.log("ORDERBOOK ethFiatRate: ", ethFiatRate);

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
                            ethFiatRate={ethFiatRate}
                            userAccountAddress={userAccountAddress}
                            rates={rates}
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
    header: <h3>Open orders</h3>,
    rates: null
};
