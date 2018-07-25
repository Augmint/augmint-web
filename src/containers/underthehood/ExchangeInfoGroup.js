import React from "react";
import { connect } from "react-redux";
import { Pgrid } from "components/PageLayout";
import { ExchangeInfo } from "./components/ExchangeInfo";
import { OrdersInfo } from "./components/OrdersInfo";
import { RatesInfo } from "./components/RatesInfo";
import exchangeProvider from "modules/exchangeProvider";
import ratesProvider from "modules/ratesProvider";

class ExchangeInfoGroup extends React.Component {
    componentDidMount() {
        exchangeProvider();
        ratesProvider();
    }

    render() {
        return (
            <Pgrid.Row>
                <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                    <ExchangeInfo contractData={this.props.exchangeData} contract={this.props.exchange} />
                </Pgrid.Column>
                <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                    <RatesInfo contractData={this.props.ratesData} contract={this.props.rates} />
                </Pgrid.Column>
                <Pgrid.Column size={{ mobile: 1, tablet: 1, desktop: 1 / 2 }}>
                    <OrdersInfo orders={this.props.orders} />
                </Pgrid.Column>
            </Pgrid.Row>
        );
    }
}

const mapStateToProps = state => ({
    exchange: state.contracts.latest.exchange,
    exchangeData: state.exchange,
    orders: state.orders.orders,
    rates: state.contracts.latest.rates,
    ratesData: state.rates
});

export default connect(mapStateToProps)(ExchangeInfoGroup);
