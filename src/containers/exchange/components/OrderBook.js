import React from "react";

import { Tokens, Wei } from "@augmint/js";
import { Pblock } from "components/PageLayout";
import { ErrorPanel } from "components/MsgPanels";
import { MoreInfoTip } from "components/toolTip";
import { PriceToolTip } from "./ExchangeToolTips";
import { Menu } from "components/augmint-ui/menu";
import CancelOrderButton from "./CancelOrderButton";
import styled from "styled-components";
import theme from "styles/theme";

import { TOKEN_SELL, TOKEN_BUY } from "modules/reducers/orders";
import { ETHEUR } from "utils/constants";
import { AEUR, ETH, Percent } from "components/augmint-ui/currencies";

const StyledTable = styled.table`
    width: 100%;
    border-spacing: 10px 2px;
    white-space: nowrap;
    text-align: right;
    th.price,
    th.ops {
        width: 17%;
    }
    th.rate,
    th.tokens,
    th.eth {
        width: 22%;
    }
    tr td:last-child {
        text-align: left;
    }
    td.estimated {
        color: ${theme.colors.mediumGrey};
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

function toWei(order, rate) {
    return order.amount instanceof Wei ? order.amount : rate ? order.amount.toWeiAt(rate, order.price) : null;
}

function toTokens(order, rate) {
    return order.amount instanceof Tokens ? order.amount : rate ? order.amount.toTokensAt(rate, order.price) : null;
}

function enhanceOrder(order, rate, userAccountAddress) {
    return {
        id: order.id,
        maker: order.maker,
        price: order.price,
        buy: order.amount instanceof Wei,

        tokens: toTokens(order, rate),
        wei: toWei(order, rate),
        effectiveRate: rate ? rate.div(order.price) : null,

        isMyOrder: order.maker.toLowerCase() === userAccountAddress.toLowerCase()
    };
}

const OrderItem = props => {
    const { order, ethFiatRate, showDirection } = props;

    return (
        <tr>
            <td className={order.buy ? "estimated" : ""}>
                <React.Fragment>
                    {order.tokens && showDirection && (order.buy ? "Buy " : "Sell ")}
                    <AEUR amount={order.tokens} />
                </React.Fragment>
            </td>
            <td className={order.buy ? "" : "estimated"}>
                <ETH amount={order.wei} />
            </td>
            <td>
                <Percent amount={order.price} />
            </td>
            <td className="estimated">
                <AEUR amount={order.effectiveRate} />
            </td>
            <td>
                <MoreInfoTip id={"more_info-" + order.id}>
                    Order ID: {order.id}
                    <br />
                    Maker: {order.maker}
                    <br />
                    <br />
                    {order.buy && (
                        <div>
                            <ETH amount={order.wei} /> * <AEUR amount={ethFiatRate} /> /{" "}
                            <Percent amount={order.price} /> = <AEUR amount={order.tokens} />
                        </div>
                    )}
                    {!order.buy && (
                        <div>
                            <AEUR amount={order.tokens} /> * <Percent amount={order.price} /> /{" "}
                            <AEUR amount={ethFiatRate} /> = <ETH amount={order.wei} />
                        </div>
                    )}
                </MoreInfoTip>
                {order.isMyOrder && <CancelOrderButton order={order} />}
            </td>
        </tr>
    );
};

const OrderList = props => {
    const { orders, ethFiatRate, showDirection } = props;

    const sum = (acc, curr) => acc.add(curr);
    const totalTokens = ethFiatRate ? orders.map(o => o.tokens).reduce(sum) : null;
    const totalEthers = ethFiatRate ? orders.map(o => o.wei).reduce(sum) : null;

    return (
        <StyledTable>
            <thead>
                <tr>
                    <th className="tokens">A-EUR amount</th>
                    <th className="eth">ETH amount</th>
                    <th className="price">
                        Price
                        <PriceToolTip />
                    </th>
                    <th className="rate">Est. {ETHEUR}</th>
                    <th className="ops" />
                </tr>
            </thead>

            <tbody>
                {orders.map(order => (
                    <OrderItem key={order.id} order={order} ethFiatRate={ethFiatRate} showDirection={showDirection} />
                ))}
            </tbody>
            {orders.length > 1 && (
                <tfoot>
                    <tr>
                        <td>
                            Total: <AEUR amount={totalTokens} />
                        </td>
                        <td>
                            <ETH amount={totalEthers} />
                        </td>
                        <td colSpan="3" />
                    </tr>
                </tfoot>
            )}
        </StyledTable>
    );
};

export class MyOrders extends React.Component {
    render() {
        const { header, userAccountAddress, testid, rates } = this.props;
        const { orders } = this.props.orders;
        // FIXME should be Tokens already
        const ethFiatRate = this.props.rates.info.ethFiatRate ? Tokens.of(this.props.rates.info.ethFiatRate) : null;

        const orderList =
            orders == null
                ? []
                : [...orders.buyOrders, ...orders.sellOrders]
                      .map(o => enhanceOrder(o, ethFiatRate, userAccountAddress))
                      .filter(o => o.isMyOrder);

        if (orderList.length === 0) {
            return null;
        }
        return (
            <Pblock header={header} data-testid={testid}>
                <OrderList
                    showDirection={true}
                    orders={orderList}
                    ethFiatRate={ethFiatRate}
                    userAccountAddress={userAccountAddress}
                    rates={rates}
                />
            </Pblock>
        );
    }
}

export class OrderBook extends React.Component {
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
        const { header: mainHeader, userAccountAddress, testid, rates, orderBookDirection } = this.props;
        const { orders, refreshError, isLoading } = this.props.orders;
        // FIXME should be Tokens already
        const ethFiatRate = this.props.rates.info.ethFiatRate ? Tokens.of(this.props.rates.info.ethFiatRate) : null;
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

        const buy = orderDirection === TOKEN_BUY;
        const orderList =
            orders == null
                ? null
                : (buy ? orders.buyOrders : orders.sellOrders).map(o =>
                      enhanceOrder(o, ethFiatRate, userAccountAddress)
                  );

        return (
            <Pblock loading={isLoading} header={header} data-testid={testid}>
                {refreshError && (
                    <ErrorPanel header="Error while fetching order list">{refreshError.message}</ErrorPanel>
                )}
                {orders == null && !isLoading && <p>Connecting...</p>}
                {isLoading && <p>Refreshing orders...</p>}
                {orderList && orderList.length === 0 && (
                    <div style={{ textAlign: "center", margin: "20px" }}>No {buy ? "buy" : "sell"} orders</div>
                )}
                {orderList && orderList.length > 0 && (
                    <OrderList
                        orders={orderList}
                        ethFiatRate={ethFiatRate}
                        userAccountAddress={userAccountAddress}
                        rates={rates}
                    />
                )}
            </Pblock>
        );
    }
}

OrderBook.defaultProps = {
    orders: null,
    userAccountAddress: null,
    header: <h3>Open orders</h3>,
    rates: null
};
