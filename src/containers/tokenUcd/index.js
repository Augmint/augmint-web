import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { refreshTokenUcd } from "modules/tokenUcd";
import { Grid, Row, Col, Panel, PageHeader } from "react-bootstrap";

const baseInfoTitle = <h3>Base Info</h3>;
const reservesTitle = <h3>Reserves</h3>;

class TokenUcd extends React.Component {
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
                                this.props.tokenUcdBn_ethBalance == null
                                    ? "?"
                                    : this.props.bn_ethUsdRate
                                          .mul(this.props.tokenUcdBn_ethBalance)
                                          .toString()}{" "}
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
    userAccount: state.ethBase.userAccount,
    accounts: state.ethBase.accounts,
    balance: state.ethBase.balance,
    isLoading: state.ethBase.isLoading,
    isConnected: state.ethBase.isConnected,
    web3ConnectionId: state.ethBase.web3ConnectionId,
    web3Instance: state.ethBase.web3Instance,

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
