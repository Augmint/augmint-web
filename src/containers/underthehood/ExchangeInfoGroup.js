import React from "react";
import { connect } from "react-redux";
import { Row, Col } from "react-bootstrap";
import { ExchangeInfo } from "./ExchangeInfo";
import { OrdersInfo } from "./OrdersInfo";
import { RatesInfo } from "./RatesInfo";
import exchangeProvider from "modules/exchangeProvider";

class ExchangeInfoGroup extends React.Component {
    componentDidMount() {
        exchangeProvider();
    }

    render() {
        const { visible, exchange, orders, rates } = this.props;
        if (!visible) return null;
        return (
            <Row>
                <Col xs={12} sm={4}>
                    <ExchangeInfo contract={exchange} />
                </Col>
                <Col xs={12} sm={4}>
                    <RatesInfo contract={rates} />
                </Col>

                <Col xs={12} sm={4}>
                    <OrdersInfo orders={orders} />
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = state => ({
    exchange: state.exchange,
    orders: state.orders.orders,
    rates: state.rates
});

export default connect(mapStateToProps)(ExchangeInfoGroup);
