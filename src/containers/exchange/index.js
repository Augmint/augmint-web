import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import OrderBook from "./components/OrderBook";
import MyOrders from "./components/MyOrders";
import TradeHistory from "./components/TradeHistory";
import PlaceOrderForm from "./components/PlaceOrderForm";
import { EthereumState } from "containers/app/EthereumState";
import MatchMultipleOrdersButton from "./components/MatchMultipleOrdersButton";
import TopNavTitlePortal from "components/portals/TopNavTitlePortal";
import NoTokenAlert from "../account/components/NoTokenAlert";
import { TOKEN_SELL } from "modules/reducers/orders";

class ExchangeHome extends React.Component {
    constructor(props) {
        super(props);
        this.toggleOrderBook = this.toggleOrderBook.bind(this);
        this.state = {
            orderBookDirection: TOKEN_SELL
        };
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        exchangeProvider();
        ratesProvider();
    }

    toggleOrderBook(direction) {
        this.setState({
            orderBookDirection: direction
        });
    }

    render() {
        const { userAccount, orders, exchange, rates, trades } = this.props;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Exchange Crypto" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "0 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 6 / 16 }}>
                                <PlaceOrderForm
                                    orders={orders}
                                    exchange={exchange}
                                    rates={rates}
                                    toggleOrderBook={this.toggleOrderBook}
                                />
                            </Pgrid.Column>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 10 / 16 }}>
                                <OrderBook
                                    testid="allOrdersBlock"
                                    orders={orders}
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="Order book"
                                    orderBookDirection={this.state.orderBookDirection}
                                    toggleOrderBook={this.toggleOrderBook}
                                />
                                {orders.orders && (
                                    <MatchMultipleOrdersButton
                                        buyOrder={orders.orders.buyOrders[0]}
                                        sellOrder={orders.orders.sellOrders[0]}
                                        label="Match orders"
                                    />
                                )}
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
                                    header="My transaction history"
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
