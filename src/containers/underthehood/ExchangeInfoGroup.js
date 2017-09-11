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
        const { exchange, orders, rates } = this.props;

        return (
            <Pgrid columns={3}>
                <Pgrid.Column>
                    <ExchangeInfo contract={exchange} />
                </Pgrid.Column>
                <Pgrid.Column>
                    <RatesInfo contract={rates} />
                </Pgrid.Column>

                <Pgrid.Column>
                    <OrdersInfo orders={orders} />
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    exchange: state.exchange,
    orders: state.orders.orders,
    rates: state.rates
});

export default connect(mapStateToProps)(ExchangeInfoGroup);
