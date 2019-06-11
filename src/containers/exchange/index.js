import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pheader, Psegment } from "components/PageLayout";
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
// import Button from 'components/augmint-ui/button'

const SIMPLE = "simple";
const ADVANCED = "advanced";

class ExchangeHome extends React.Component {
    constructor(props) {
        super(props);
        this.toggleOrderBook = this.toggleOrderBook.bind(this);
        this.toggleSimpleBuy = this.toggleSimpleBuy.bind(this);
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

    toggleSimpleBuy(val) {
        this.setState({
            simpleBuy: val === SIMPLE
        });
    }

    toggleOrderBook(direction) {
        this.setState({
            orderBookDirection: direction
        });
    }

    render() {
        const { userAccount, orders, exchange, rates, trades } = this.props;

        const content = this.state.simpleBuy ? "Show advanced setting" : "Hide advanced settings";
        const mode = this.state.simpleBuy ? ADVANCED : SIMPLE;
        const switchForms = (
            <a
                className="switch"
                onClick={e => {
                    e.preventDefault();
                    this.toggleSimpleBuy(mode);
                }}
            >
                {content}
            </a>
        );

        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Exchange Crypto" />
                    </TopNavTitlePortal>

                    <NoTokenAlert style={{ margin: "10px 15px 5px" }} />

                    <div className="exchange-container">
                        <div>
                            {/*<div className="toggle">{header}</div>*/}
                            {this.state.simpleBuy && (
                                <SimpleBuyForm
                                    orders={orders}
                                    exchange={exchange}
                                    toggleOrderBook={this.toggleOrderBook}
                                    rates={rates}
                                >
                                    {switchForms}
                                </SimpleBuyForm>
                            )}
                            {!this.state.simpleBuy && (
                                <PlaceOrderForm
                                    exchange={exchange}
                                    rates={rates}
                                    toggleOrderBook={this.toggleOrderBook}
                                >
                                    {switchForms}
                                </PlaceOrderForm>
                            )}
                        </div>

                        <div className="exchange-orders">
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
                        </div>
                    </div>

                    {orders.orders && <MatchMultipleOrdersButton orderBook={orders.orders} label="Match orders" />}

                    <TradeHistory
                        trades={trades}
                        orders={orders}
                        userAccountAddress={userAccount.address}
                        header="My transaction history"
                    />
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
