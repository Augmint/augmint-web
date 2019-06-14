import React from "react";
import { connect } from "react-redux";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
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
import store from "modules/store";

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
        augmintTokenProvider();
        exchangeProvider();
        ratesProvider();
    }

    toggleSimpleBuy(val) {
        let simple, advanced;
        const form = store.getState().form;
        if (form) {
            simple =
                form.SimpleBuyForm && form.SimpleBuyForm.values
                    ? form.SimpleBuyForm.values.simpleTokenAmount
                    : undefined;
            advanced =
                form.PlaceOrderForm && form.PlaceOrderForm.values ? form.PlaceOrderForm.values.tokenAmount : undefined;
        }
        const tokenValue = val === SIMPLE ? advanced : simple;
        this.setState({
            simpleBuy: val === SIMPLE,
            tokenValue: tokenValue
        });
    }

    toggleOrderBook(direction) {
        this.setState({
            orderBookDirection: direction
        });
    }

    render() {
        const { userAccount, orders, exchange, rates, trades } = this.props;

        const mode = this.state.simpleBuy ? ADVANCED : SIMPLE;
        const switchForms = (
            <a
                className="switch"
                onClick={e => {
                    e.preventDefault();
                    this.toggleSimpleBuy(mode);
                }}
            >
                {mode === ADVANCED ? "Show advanced order options »" : "Hide advanced order options »"}
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
                                    exchange={exchange}
                                    toggleOrderBook={this.toggleOrderBook}
                                    rates={rates}
                                    token={this.state.tokenValue}
                                >
                                    {switchForms}
                                </SimpleBuyForm>
                            )}
                            {!this.state.simpleBuy && (
                                <PlaceOrderForm
                                    exchange={exchange}
                                    rates={rates}
                                    toggleOrderBook={this.toggleOrderBook}
                                    token={this.state.tokenValue}
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
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="Order book"
                                    orderBookDirection={this.state.orderBookDirection}
                                    toggleOrderBook={this.toggleOrderBook}
                                />
                            )}
                        </div>
                    </div>

                    {orders && <MatchMultipleOrdersButton orderBook={orders} label="Match orders" />}

                    <TradeHistory
                        trades={trades}
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
    orders: state.orders.orders,
    rates: state.rates,
    trades: state.trades
});

export default connect(mapStateToProps)(ExchangeHome);
