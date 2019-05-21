import React from "react";

import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/toolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import { Menu } from "components/augmint-ui/menu";
import CancelOrderButton from "./CancelOrderButton";
import BigNumber from "bignumber.js";
import styled from "styled-components";

import { TOKEN_SELL, TOKEN_BUY } from "modules/reducers/orders";
import { DECIMALS, ETHEUR } from "utils/constants";
import { floatNumberConverter } from "utils/converter";
import { AEUR, ETH } from "components/augmint-ui/currencies";

const StyledTable = styled.table`
    width: 100%;
    border-spacing: 10px 2px;
    white-space: nowrap;
    text-align: right;
    tr td:last-child {
        text-align: left;
    }
    tfoot {
        td {
            padding-top: 10px;
        }
        .AEUR,
        .ETH {
            font-weight: bold;
        }
    }
`;

const OrderItem = props => {
    const { order, ethFiatRate, userAccountAddress } = props;
    const bn_ethFiatRate = ethFiatRate !== null && new BigNumber(ethFiatRate);

    const myOrder = order.maker.toLowerCase() === userAccountAddress.toLowerCase();
    const displayPrice = floatNumberConverter(order.price, DECIMALS).toFixed(2);

    function parsePrice(price) {
        return Math.round(price * 100) / 10000;
    }

    const rate = ethFiatRate / parsePrice(displayPrice);

    if (order.direction === TOKEN_SELL) {
        const ethValue = (order.amount * order.price) / bn_ethFiatRate;
        return (
            <tr>
                <td>
                    <AEUR amount={order.amount} />
                </td>
                <td>
                    <ETH amount={ethValue} />
                </td>
                <td>{displayPrice}%</td>
                <td>
                    <AEUR amount={rate} />
                </td>
                <td>
                    <MoreInfoTip id={"more_info-" + order.id}>
                        <p>
                            Sell A€ order: <br />
                            {order.amount} A€ @{displayPrice}% of current {ETHEUR} = <br />
                            {order.amount} A€ * {order.price} €/A€ / {ethFiatRate} {ETHEUR} = <br />
                            {ethValue} ETH
                        </p>
                        Maker: {order.maker}
                        <br />
                        Order Id: {order.id}
                    </MoreInfoTip>
                    {myOrder && <CancelOrderButton order={order} />}
                </td>
            </tr>
        );
    } else {
        // TOKEN_BUY

        const aeurValue = (bn_ethFiatRate / order.price) * order.amount;
        return (
            <tr>
                <td>
                    <AEUR amount={aeurValue} />
                </td>
                <td>
                    <ETH amount={order.amount} />
                </td>
                <td>{displayPrice}%</td>
                <td>
                    <AEUR amount={rate} />
                </td>
                <td>
                    <MoreInfoTip id={"more_info-" + order.id}>
                        <p>
                            Buy A€ Order: <br />
                            {order.amount} ETH @{displayPrice}% of current {ETHEUR} = <br />
                            {order.amount} ETH * {ethFiatRate} {ETHEUR} / {order.price} €/A€ = <br />
                            {aeurValue} A€
                        </p>
                        Maker: {order.maker}
                        <br />
                        Order Id: {order.id}
                    </MoreInfoTip>
                    {myOrder && <CancelOrderButton order={order} />}
                </td>
            </tr>
        );
    }
};

const OrderList = props => {
    const { sellOrders, buyOrders, userAccountAddress, ethFiatRate, orderDirection } = props;

    const totalEthBuyAmount = parseFloat(buyOrders.reduce((sum, order) => order.bnEthAmount.add(sum), 0));
    const totalEthSellAmount = sellOrders.reduce(
        (sum, order) => new BigNumber(((order.amount * order.price) / ethFiatRate).toFixed(5)).add(sum),
        0
    );
    const totalAeurSellAmount = sellOrders.reduce((sum, order) => order.amount + sum, 0);
    const totalAeurBuyAmount = buyOrders.reduce(
        (sum, order) => new BigNumber(((ethFiatRate / order.price) * order.amount).toFixed(2)).add(sum),
        0
    );

    const isSell = orderDirection === TOKEN_SELL;
    const orders = isSell ? sellOrders : buyOrders;

    if (orders.length === 0) {
        return <div style={{ textAlign: "center", margin: "20px" }}>No {isSell ? "sell" : "buy"} orders</div>;
    }

    return (
        <StyledTable>
            <thead>
                <tr>
                    <th>{isSell ? "A-EUR amount" : "Est. A-EUR amount"}</th>
                    <th>{isSell ? "Est. ETH amount" : "ETH amount"}</th>
                    <th>
                        Price
                        <PriceToolTip id={isSell ? "price_sell" : "price_buy"} />
                    </th>
                    <th>Est. {ETHEUR}</th>
                    <th />
                </tr>
            </thead>

            <tbody>
                {orders.map(order => (
                    <OrderItem
                        key={order.id}
                        order={order}
                        ethFiatRate={ethFiatRate}
                        userAccountAddress={userAccountAddress}
                    />
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td>
                        Total: {isSell ? <AEUR amount={totalAeurSellAmount} /> : <AEUR amount={totalAeurBuyAmount} />}
                    </td>
                    <td>{isSell ? <ETH amount={totalEthSellAmount} /> : <ETH amount={totalEthBuyAmount} />}</td>
                    <td colSpan="3" />
                </tr>
            </tfoot>
        </StyledTable>
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
                        tabIndex="0"
                    >
                        A-EUR Sellers
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === TOKEN_BUY}
                        data-index={TOKEN_BUY}
                        onClick={this.onOrderDirectionChange}
                        data-testid="buyOrdersMenuLink"
                        className={"buySell"}
                        tabIndex="0"
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
                    <OrderList
                        buyOrders={buyOrders}
                        sellOrders={sellOrders}
                        ethFiatRate={ethFiatRate}
                        userAccountAddress={userAccountAddress}
                        rates={rates}
                        orderDirection={orderDirection}
                    />
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
