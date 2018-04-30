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
            <Pgrid columns={3}>
                <Pgrid.Column>
                    <ExchangeInfo contractData={this.props.exchangeData} contract={this.props.exchange} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <RatesInfo contractData={this.props.ratesData} contract={this.props.rates} />
                </Pgrid.Column>

                <Pgrid.Column>
                    <OrdersInfo orders={this.props.orders} />
                </Pgrid.Column>
            </Pgrid>
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
