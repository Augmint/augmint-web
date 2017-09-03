import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import tokenUcdProvider from "modules/tokenUcdProvider";
import ratesProvider from "modules/ratesProvider";
import { refreshTokenUcd } from "modules/reducers/tokenUcd";
import { Grid, Row, Col, Panel, PageHeader } from "react-bootstrap";

const baseInfoTitle = <h3>Base Info</h3>;
const reservesTitle = <h3>Reserves</h3>;

class TokenUcd extends React.Component {
    componentDidMount() {
        ratesProvider();
        tokenUcdProvider();
    }

    handleTokenUcdRefreshClick = e => {
        e.preventDefault();
        this.props.refreshTokenUcd();
    };

    render() {
        return (
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>Token UCD</PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} md={4}>
                        <Panel header={baseInfoTitle}>
                            <p>
                                Total token supply:{" "}
                                {this.props.tokenUcdTotalSupply} UCD
                            </p>
                        </Panel>
                    </Col>
                    <Col xs={12} md={4}>
                        <Panel header={reservesTitle}>
                            <p>
                                ETH Reserve: {this.props.tokenUcdEthBalance} ETH
                                ({this.props.bn_ethUsdRate == null ||
                                this.props.tokenUcdBn_ethBalance == null ? (
                                    "?"
                                ) : (
                                    this.props.bn_ethUsdRate
                                        .mul(this.props.tokenUcdBn_ethBalance)
                                        .toString()
                                )}{" "}
                                USD)
                            </p>
                            <p>
                                UCD Reserve: {this.props.tokenUcdUcdBalance} UCD
                            </p>
                        </Panel>
                    </Col>
                    <Col xs={12} md={4}>
                        <Link className="btn btn-link" to="/loan/collect">
                            <h3>Loans to Collect</h3>
                        </Link>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.web3Connect.userAccount,
    accounts: state.web3Connect.accounts,
    balance: state.web3Connect.balance,
    isLoading: state.web3Connect.isLoading,
    isConnected: state.web3Connect.isConnected,
    web3ConnectionId: state.web3Connect.web3ConnectionId,
    web3Instance: state.web3Connect.web3Instance,

    ratesContract: state.rates.contract,
    bn_ethUsdRate: state.rates.info.bn_ethUsdRate,

    tokenUcdContract: state.tokenUcd.contract,
    tokenUcdUcdBalance: state.tokenUcd.info.ucdBalance,
    tokenUcdEthBalance: state.tokenUcd.info.ethBalance,
    tokenUcdBn_ethBalance: state.tokenUcd.info.bn_ethBalance,
    tokenUcdTotalSupply: state.tokenUcd.info.totalSupply,
    loanManagerAddress: state.tokenUcd.info.loanManagerAddress
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            refreshTokenUcd
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(TokenUcd);
