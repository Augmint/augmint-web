import React from "react";
import { connect } from "react-redux";
import { Grid, Row, Col, PageHeader } from "react-bootstrap";
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
            <Grid>
                <Row>
                    <Col>
                        <EthereumState />
                        <PageHeader>Buy & Sell UCD</PageHeader>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12} sm={6}>
                        <Col xs={12}>
                            <ExchangeSummary
                                exchangeInfo={exchange.info}
                                rates={rates}
                            />
                            <PlaceOrderForm
                                orders={orders}
                                exchange={exchange}
                                rates={rates}
                            />

                            <OrderList
                                orders={orders}
                                userAccountAddress={userAccount.address}
                                header={<h3>My orders</h3>}
                                filter={item => {
                                    return item.maker === userAccount.address;
                                }}
                            />
                        </Col>
                    </Col>

                    <Col xs={12} sm={6}>
                        <AccountInfo account={userAccount} />
                        <OrderList
                            orders={orders}
                            userAccountAddress={userAccount.address}
                            header={<h3>All orders</h3>}
                        />
                    </Col>
                </Row>
            </Grid>
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
