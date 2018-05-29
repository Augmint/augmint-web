import React from "react";
import { connect } from "react-redux";
import { connectWeb3 } from "modules/web3Provider";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";
import augmintTokenProvider from "modules/augmintTokenProvider";
import AccountInfo from "components/AccountInfo";
import OrderBook from "./components/OrderBook";
import TradeHistory from "./components/TradeHistory";
import ExchangeSummary from "./components/ExchangeSummary";
import PlaceOrderForm from "./components/PlaceOrderForm";
import { EthereumState } from "containers/app/EthereumState";
import MatchOrdersButton from "./components/MatchOrdersButton";

import TopNavTitlePortal from 'components/portals/TopNavTitlePortal';

class ExchangeHome extends React.Component {
    componentDidMount() {
        connectWeb3();
        augmintTokenProvider();
        exchangeProvider();
        ratesProvider();
    }
    render() {
        const { orders, userAccount, exchange, rates, trades } = this.props;
        return (
            <EthereumState>
                <Psegment>
                    <TopNavTitlePortal>
                        <Pheader header="Buy & Sell A-EUR" />
                    </TopNavTitlePortal>
                    <Pgrid>
                        <Pgrid.Row columns={2}>
                            <Pgrid.Column>
                                <AccountInfo account={userAccount} />

                                {/* {rates.isLoading || !rates.isLoaded ? (
                                    <h5>Loading rates...</h5>
                                ) : ( */}
                                <PlaceOrderForm //rates.info &&
                                    // initialValues={{
                                    //     price: rates.info.ethFiatRate
                                    // }}
                                    orders={orders}
                                    exchange={exchange}
                                    rates={rates}
                                />
                                {/* )} */}

                                <OrderBook
                                    testid="myOrdersBlock"
                                    orders={orders}
                                    rates={rates}
                                    userAccountAddress={userAccount.address}
                                    header="My orders"
                                    filter={item => {
                                        return item.maker.toLowerCase() === userAccount.address.toLowerCase();
                                    }}
                                />
                            </Pgrid.Column>

                            <Pgrid.Column>
                                <ExchangeSummary exchange={exchange} rates={rates} />
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
                                    header="All orders"
                                />
                            </Pgrid.Column>
                        </Pgrid.Row>
                        <Pgrid.Row>
                            <TradeHistory
                                trades={trades}
                                userAccountAddress={userAccount.address}
                                header="Trades history"
                            />
                        </Pgrid.Row>
                    </Pgrid>
                </Psegment>
            </EthereumState>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    exchange: state.exchange,
    orders: state.orders,
    rates: state.rates,
    trades: state.trades
});

export default connect(mapStateToProps)(ExchangeHome);
