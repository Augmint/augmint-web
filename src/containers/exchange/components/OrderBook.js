import React from "react";

import { Pblock } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupColumn as Col, MyGridTable } from "components/MyListGroups";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/toolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import { Menu } from "components/augmint-ui/menu";
import CancelOrderButton from "./CancelOrderButton";
import BigNumber from "bignumber.js";
import styled from "styled-components";

import { TOKEN_SELL, TOKEN_BUY } from "modules/reducers/orders";
import { DECIMALS, DECIMALS_DIV, ETHEUR } from "utils/constants";
import { floatNumberConverter } from "utils/converter";

const StyledSpan = styled.span`
    display: block;
    text-align: right;
`;

const StyledP = styled.p`
    margin: 15px 0;
    text-align: right;
`;

const OrderItem = props => {
    const { order, ethFiatRate, userAccountAddress } = props;
    const bn_ethFiatRate = ethFiatRate !== null && new BigNumber(ethFiatRate);

    const displayPrice = floatNumberConverter(order.price, DECIMALS).toFixed(2);

    function parsePrice(price) {
        return Math.round(price * 100) / 10000;
    }

    const actualValue =
        order.direction === TOKEN_SELL
            ? ((order.amount * order.price) / bn_ethFiatRate).toFixed(5)
            : ((bn_ethFiatRate / order.price) * order.amount).toFixed(2);

    const ret = [
        <Col style={{ padding: ".1em 0" }} width={3} key={`${order.direction}-amount`}>
            {order.direction === TOKEN_SELL && <StyledSpan>{order.amount.toFixed(2)} A€</StyledSpan>}
            {order.direction === TOKEN_BUY && <StyledSpan>{actualValue} A€</StyledSpan>}
        </Col>,
        <Col style={{ padding: ".1em 0" }} width={3} key={`${order.direction}-est_amount`}>
            {order.direction === TOKEN_SELL && <StyledSpan>{actualValue} ETH</StyledSpan>}
            {order.direction === TOKEN_BUY && <StyledSpan>{order.amount.toFixed(5)} ETH</StyledSpan>}
        </Col>,
        <Col style={{ padding: ".1em 0" }} width={2} key={`${order.direction}-price`}>
            <StyledSpan>{displayPrice}%</StyledSpan>
        </Col>,
        <Col style={{ padding: ".1em 0" }} width={3} key={`${order.direction}-rate`}>
            <StyledSpan>{(ethFiatRate / parsePrice(displayPrice)).toFixed(2)} A€</StyledSpan>
        </Col>,
        <Col style={{ padding: ".1em 0 0 5px" }} width={2} key={`${order.direction}-action`}>
            <MoreInfoTip id={"more_info-" + order.id}>
                {order.direction === TOKEN_SELL && (
                    <p>
                        Sell A€ order: <br />
                        {order.amount} A€ @{displayPrice}% of current {ETHEUR} = <br />
                        {order.amount} A€ * {order.price} €/A€ / {ethFiatRate} {ETHEUR} = <br />
                        {actualValue} ETH
                    </p>
                )}
                {order.direction === TOKEN_BUY && (
                    <p>
                        Buy A€ Order: <br />
                        {order.amount} ETH @{displayPrice}% of current {ETHEUR} = <br />
                        {order.amount} ETH * {ethFiatRate} {ETHEUR} / {order.price} €/A€ = <br />
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
    const { sellOrders, buyOrders, userAccountAddress, ethFiatRate, orderDirection } = props;

    const totalEthBuyAmount = parseFloat(buyOrders.reduce((sum, order) => order.bn_ethAmount.add(sum), 0)).toFixed(5);
    const totalEthSellAmount = sellOrders
        .reduce((sum, order) => new BigNumber(((order.amount * order.price) / ethFiatRate).toFixed(5)).add(sum), 0)
        .toFixed(5);
    const totalAeurSellAmount = new BigNumber(sellOrders.reduce((sum, order) => order.bn_amount.add(sum), 0))
        .div(DECIMALS_DIV)
        .toFixed(2);
    const totalAeurBuyAmount = buyOrders
        .reduce((sum, order) => new BigNumber(((ethFiatRate / order.price) * order.amount).toFixed(2)).add(sum), 0)
        .toFixed(2);

    const listLen = Math.max(buyOrders.length, sellOrders.length);
    const itemList = [];

    for (let i = 0; i < listLen; i++) {
        itemList.push(
            <Row key={`ordersRow-${i}`} valign="top">
                {orderDirection === TOKEN_SELL ? (
                    i < sellOrders.length ? (
                        <OrderItem
                            order={sellOrders[i]}
                            ethFiatRate={ethFiatRate}
                            userAccountAddress={userAccountAddress}
                        />
                    ) : (
                        <Col width={13} />
                    )
                ) : i < buyOrders.length ? (
                    <OrderItem order={buyOrders[i]} ethFiatRate={ethFiatRate} userAccountAddress={userAccountAddress} />
                ) : (
                    <Col width={13} />
                )}
            </Row>
        );
    }

    return (
        <MyListGroup>
            <Row wrap={false} halign="center" valign="top">
                <Col style={{ textAlign: "right" }} width={3}>
                    <strong> {orderDirection === TOKEN_SELL ? "A-EUR amount" : "Est. A-EUR amount"} </strong>
                </Col>
                <Col style={{ textAlign: "right" }} width={3}>
                    <strong> {orderDirection === TOKEN_SELL ? "Est. ETH amount" : "ETH amount"} </strong>
                </Col>
                <Col style={{ textAlign: "right" }} width={2}>
                    <strong>Price</strong>
                    <PriceToolTip id={orderDirection === TOKEN_SELL ? "price_sell" : "price_buy"} />
                </Col>
                <Col style={{ textAlign: "right" }} width={3}>
                    <strong>Est. {ETHEUR}</strong>
                </Col>
                <Col width={2} style={{ padding: ".1em 0 0 5px" }} />
            </Row>
            {itemList}
            <Row halign="center" valign="top">
                <Col width={3} style={{ textAlign: "center" }}>
                    {orderDirection === TOKEN_SELL
                        ? totalAeurSellAmount > 0 && (
                              <StyledP>
                                  Total: <strong>{totalAeurSellAmount} A€</strong>
                              </StyledP>
                          )
                        : totalAeurBuyAmount > 0 && (
                              <StyledP>
                                  Total: <strong>{totalAeurBuyAmount} A€</strong>
                              </StyledP>
                          )}
                </Col>
                <Col width={3} style={{ textAlign: "center" }}>
                    {orderDirection === TOKEN_SELL
                        ? totalAeurSellAmount > 0 && (
                              <StyledP>
                                  <strong>{totalEthSellAmount} ETH</strong>
                              </StyledP>
                          )
                        : totalEthBuyAmount > 0 && (
                              <StyledP>
                                  <strong>{totalEthBuyAmount} ETH</strong>
                              </StyledP>
                          )}
                </Col>
                <Col width={2} />
                <Col width={3} />
                <Col width={2} style={{ padding: ".1em 0 0 5px" }} />
            </Row>
        </MyListGroup>
    );
};

export default class OrderBook extends React.Component {
    constructor(props) {
        super(props);
        this.toggleOrderBook = this.toggleOrderBook.bind(this);
        this.onOrderDirectionChange = this.onOrderDirectionChange.bind(this);
    }

    toggleOrderBook(e) {
        this.props.toggleOrderBook(e);
    }

    onOrderDirectionChange(e) {
        this.toggleOrderBook(+e.target.attributes["data-index"].value);
    }

    render() {
        const { filter, header: mainHeader, userAccountAddress, testid, rates, orderBookDirection } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        const buyOrders = orders == null ? [] : orders.buyOrders.filter(filter);
        const sellOrders = orders == null ? [] : orders.sellOrders.filter(filter);
        const { ethFiatRate } = this.props.rates.info;
        const orderDirection = orderBookDirection;

        const header = (
            <div>
                {mainHeader}
                <Menu style={{ marginBottom: -11, marginTop: 11 }}>
                    <Menu.Item
                        active={orderDirection === TOKEN_SELL}
                        data-index={TOKEN_SELL}
                        onClick={this.onOrderDirectionChange}
                        data-testid="sellOrdersMenuLink"
                        className={"buySell"}
                    >
                        A-EUR Sellers
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === TOKEN_BUY}
                        data-index={TOKEN_BUY}
                        onClick={this.onOrderDirectionChange}
                        data-testid="buyOrdersMenuLink"
                        className={"buySell"}
                    >
                        A-EUR Buyers
                    </Menu.Item>
                </Menu>
            </div>
        );

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
                            orderDirection={orderDirection}
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
