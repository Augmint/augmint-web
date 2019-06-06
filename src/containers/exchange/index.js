import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pgrid, Pheader, Psegment } from "components/PageLayout";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import { OrderBook, MyOrders } from "./components/OrderBook";
import TradeHistory from "./components/TradeHistory";
import PlaceOrderForm from "./components/PlaceOrderForm";
import SimpleBuyForm from "./components/SimpleBuyForm";
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
            orderBookDirection: TOKEN_SELL,
            simpleBuy: true
        };
    }

    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        exchangeProvider();
        ratesProvider();
    }

    toggleSimpleBuy(e) {
        e.persist();
        let value = parseInt(e.target.value) > 0;
        this.setState({
            simpleBuy: value
        });
    }

    toggleOrderBook(direction) {
        this.setState({
            orderBookDirection: direction
        });
    }

    render() {
        const { userAccount, orders, exchange, rates, trades } = this.props;
        const simpleValue = this.state.simpleBuy ? 1 : 0;

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Exchange Crypto" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "10px 15px 5px" }} />
                    <Pgrid>
                        <Pgrid.Row>
                            <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 3 }}>
                                <div>
                                    <div className="toggle" style={{ margin: "1rem", color: "black" }}>
                                        <span>Simple buy</span>
                                        <input
                                            type="range"
                                            min="0"
                                            max="1"
                                            value={simpleValue}
                                            step="1"
                                            onChange={e => this.toggleSimpleBuy(e)}
                                        />
                                    </div>
                                    {this.state.simpleBuy && (
                                        <SimpleBuyForm
                                            orders={orders}
                                            exchange={exchange}
                                            toggleOrderBook={this.toggleOrderBook}
                                            rates={rates}
                                        />
                                    )}
                                    {!this.state.simpleBuy && (
                                        <PlaceOrderForm
                                            exchange={exchange}
                                            rates={rates}
                                            toggleOrderBook={this.toggleOrderBook}
                                        />
                                    )}
                                </div>
                            </Pgrid.Column>
                            <Pgrid.Column
                                style={{ marginTop: "1rem" }}
                                size={{ mobile: 1, tablet: 1 / 2, desktop: 10 / 16 }}
                            >
                                <MyOrders
                                    testid="myOrdersBlock"
                                    orders={orders}
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="My open orders"
                                />
                                {!this.state.simpleBuy && (
                                    <OrderBook
                                        testid="allOrdersBlock"
                                        orders={orders}
                                        rates={rates}
                                        userAccountAddress={userAccount.address}
                                        header="Order book"
                                        orderBookDirection={this.state.orderBookDirection}
                                        toggleOrderBook={this.toggleOrderBook}
                                    />
                                )}
                                {orders.orders && (
                                    <MatchMultipleOrdersButton orderBook={orders.orders} label="Match orders" />
                                )}
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
