import React from "react";
import { connect } from "react-redux";
import { Grid, Row, Col, PageHeader } from "react-bootstrap";
//import ExchangeProvider from "containers/exchange/ExchangeProvider";
import exchangeProvider from "modules/exchangeProvider";
import AccountInfo from "components/AccountInfo";

class ExchangeHome extends React.Component {
    componentDidMount() {
        exchangeProvider();
    }
    render() {
        //let exchangeProvider = ExchangeProvider.getInstance();
        return (
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>Buy & Sell UCD</PageHeader>
                    </Col>
                </Row>

                <Row>
                    <Col xs={6}>
                        <Col xs={12}>
                            <AccountInfo account={this.props.userAccount} />
                        </Col>
                        <Col xs={12}>
                            <p>TODO: Sell/Buy form here...</p>
                        </Col>
                        <Col xs={12}>
                            <p>TODO: Order book summary here...</p>
                        </Col>
                    </Col>

                    <Col xs={6}>
                        <p>TODO: my orders list here</p>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account
});

export default connect(mapStateToProps)(ExchangeHome);
