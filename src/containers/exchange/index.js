import React from "react";
import { connect } from "react-redux";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";
import tokenUcdProvider from "modules/tokenUcdProvider";
import AccountInfo from "components/AccountInfo";
import OrderList from "./components/OrderList";
import ExchangeSummary from "./components/ExchangeSummary";
import PlaceOrderForm from "./components/PlaceOrderForm";
import { EthereumState } from "containers/app/EthereumState";

class ExchangeHome extends React.Component {
    componentDidMount() {
        tokenUcdProvider();
        exchangeProvider();
        ratesProvider();
    }
    render() {
        const { orders, userAccount, exchange, rates } = this.props;
        return (
            <EthereumState>
                <Psegment>
                    <Pheader header="Buy & Sell UCD" />
                    <Pgrid>
                        <Pgrid.Row columns={2}>
                            <Pgrid.Column>
                                <AccountInfo account={userAccount} />

                                <PlaceOrderForm
                                    orders={orders}
                                    exchange={exchange}
                                    rates={rates}
                                />

                                <OrderList
                                    orders={orders}
                                    userAccountAddress={userAccount.address}
                                    header="My orders"
                                    filter={item => {
                                        return (
                                            item.maker.toLowerCase() ===
                                            userAccount.address.toLowerCase()
                                        );
                                    }}
                                />
                            </Pgrid.Column>

                            <Pgrid.Column>
                                <ExchangeSummary
                                    exchange={exchange}
                                    rates={rates}
                                />
                                <OrderList
                                    orders={orders}
                                    userAccountAddress={userAccount.address}
                                    header="All orders"
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
    userAccount: state.userBalances.account,
    exchange: state.exchange,
    orders: state.orders,
    rates: state.rates
});

export default connect(mapStateToProps)(ExchangeHome);
