import React from "react";
import { connect } from "react-redux";
import { Grid, Row, Col, PageHeader } from "react-bootstrap";
import exchangeProvider from "modules/exchangeProvider";
import AccountInfo from "components/AccountInfo";
import OrderList from "components/OrderList";

class ExchangeHome extends React.Component {
    componentDidMount() {
        exchangeProvider();
    }
    render() {
        const { orders, userAccount } = this.props;
        return (
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>Buy & Sell UCD</PageHeader>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12} sm={6}>
                        <Col xs={12}>
                            <AccountInfo account={userAccount} />

                            <p>TODO: Sell/Buy form here...</p>

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
                        <OrderList
                            orders={orders}
                            userAccountAddress={userAccount.address}
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    orders: state.orders
});

export default connect(mapStateToProps)(ExchangeHome);
