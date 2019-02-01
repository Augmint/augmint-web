import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import FiatExchange from "./components/FiatExchange";
import OrderBook from "./components/OrderBook";
import MyOrders from "./components/MyOrders";
import TradeHistory from "./components/TradeHistory";
import PlaceOrderForm from "./components/PlaceOrderForm";
import { EthereumState } from "containers/app/EthereumState";
import MatchOrdersButton from "./components/MatchOrdersButton";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";

class ExchangeHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        exchangeProvider();
        ratesProvider();
    }

    render() {
        const { orders, exchange, rates, trades } = this.props;
        const userAccount = this.props.userAccount;
        // const buyOrder = orders.orders.buyOrders[0];
        // const sellOrder = orders.orders.sellOrders[0];
        // const isMatching = sellOrder && buyOrder && sellOrder.price <= buyOrder.price;
        console.log("ORDERS: ", orders);
        // {orders.orders && !isMatching && (

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Buy & Sell A-EUR" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 3 }}>
                                <FiatExchange
                                    header="€ &harr; A€ on partner exchange"
                                    web3Connect={this.props.web3Connect}
                                />
                                <PlaceOrderForm orders={orders} exchange={exchange} rates={rates} />
                            </Pgrid.Column>

                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 2 / 3 }}>
                                {orders.orders && (
                                    <MatchOrdersButton
                                        buyOrder={orders.orders.buyOrders[0]}
                                        sellOrder={orders.orders.sellOrders[0]}
                                        label="Match top sell and buy order"
                                    />
                                )}
                                <OrderBook
                                    testid="allOrdersBlock"
                                    orders={orders}
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="Order book"
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 2 / 2, desktop: 3 / 3 }}>
                                <MyOrders
                                    testid="myOrdersBlock"
                                    orders={orders}
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="My open orders"
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 2 / 2, desktop: 3 / 3 }}>
                                <TradeHistory
                                    trades={trades}
                                    orders={orders}
                                    userAccountAddress={userAccount.address}
                                    header="My trade history"
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    web3Connect: state.web3Connect,
    userAccount: state.userBalances.account,
    exchange: state.exchange,
    orders: state.orders,
    rates: state.rates,
    trades: state.trades
});

export default connect(mapStateToProps)(ExchangeHome);
