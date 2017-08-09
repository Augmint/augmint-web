/* TODO: split panels into components */
import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { setupWeb3 } from "modules/ethBase";
import { fetchUserBalance } from "modules/userBalances";
import { refreshRates } from "modules/rates";
import { refreshTokenUcd } from "modules/tokenUcd";
import { refreshLoanManager } from "modules/loanManager";
import {
    ButtonToolbar,
    Button,
    Grid,
    Row,
    Col,
    Panel,
    Table,
    PageHeader
} from "react-bootstrap";
import stringifier from "stringifier";

import store from "store.js"; /// for debug

const web3Title = <h3>Web3 connection</h3>;
const userAccountTitle = <h3>User Account</h3>;
const availableAccountsTitle = <h3>Accounts</h3>;
const ratesTitle = <h3>Rates contract</h3>;
const tokenUcdTitle = <h3>TokenUcd contract</h3>;
const loanManagerTitle = <h3>LoanManager contract</h3>;
const productsTitle = <h3>Loan Products</h3>;

const stringify = stringifier({ maxDepth: 2, indent: "   " });

function ArrayDump(props) {
    const items = props.items;
    let listItems;

    if (items === null) {
        listItems = <span>null</span>;
    } else if (items.length === 0) {
        listItems = <span>empty array</span>;
    } else {
        listItems = items.map((item, index) =>
            <tr key={index}>
                <td>
                    <pre style={{ fontSize: 10 + "px" }}>
                        [{index}] {stringify(item)}
                    </pre>
                </td>
            </tr>
        );
    }

    return (
        <Table condensed striped>
            <tbody>
                {listItems}
            </tbody>
        </Table>
    );
}

class underTheHood extends React.Component {
    handleBalanceRefreshClick = e => {
        e.preventDefault();
        this.props.getBalance(this.props.userAccount);
        console.log(store.getState());
        //console.log(this.props.rates)
    };

    handleRatesRefreshClick = e => {
        e.preventDefault();
        this.props.refreshRates();
    };

    handleTokenUcdRefreshClick = e => {
        e.preventDefault();
        this.props.refreshTokenUcd();
    };

    handleLoanManagerRefreshClick = e => {
        e.preventDefault();
        this.props.refreshLoanManager();
    };

    render() {
        return (
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>Under the hood</PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col xs={8} md={8}>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={web3Title}>
                                    <p>
                                        {this.props.isConnected
                                            ? "connected"
                                            : "not connected"}
                                    </p>
                                    <p>
                                        Network: {this.props.network.name} Id:{" "}
                                        {this.props.network.id}
                                    </p>
                                    <p className="white-space:pre-wrap">
                                        Provider:{" "}
                                        <small>
                                            {this.props.web3Instance
                                                ? stringify(
                                                      this.props.web3Instance
                                                          .currentProvider
                                                  )
                                                : "No web3 Instance"}
                                        </small>
                                    </p>
                                    <p>
                                        Internal Connection Id:{" "}
                                        {this.props.web3ConnectionId}
                                    </p>
                                    <Button
                                        bsSize="small"
                                        onClick={this.props.setupWeb3}
                                    >
                                        Reconnect web3
                                    </Button>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={userAccountTitle}>
                                    <p>
                                        {this.props.userAccount}
                                    </p>
                                    <p>
                                        ETH Balance:{" "}
                                        {this.props.userAccountBal.ethBalance}{" "}
                                        ETH
                                    </p>
                                    <p>
                                        UCD Balance:{" "}
                                        {this.props.userAccountBal.ucdBalance}{" "}
                                        UCD
                                    </p>
                                    <ButtonToolbar>
                                        <Button
                                            bsSize="small"
                                            onClick={
                                                this.handleBalanceRefreshClick
                                            }
                                            disabled={
                                                this.props.isLoading ||
                                                !this.props.isConnected
                                            }
                                        >
                                            Refresh balance
                                        </Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={ratesTitle}>
                                    <p>
                                        ETH/USD: {this.props.ethUsdRate}
                                    </p>
                                    <p>
                                        ETH/USDc: {this.props.ethUsdcRate}
                                    </p>
                                    <p>
                                        USD scale: {this.props.usdScale}
                                    </p>
                                    <p>
                                        <small>
                                            Contract:{" "}
                                            {this.props.ratesContract == null
                                                ? "No contract"
                                                : this.props.ratesContract
                                                      .instance.address}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Owner: {this.props.ratesOwner}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Balance:{" "}
                                            {this.props.ratesEthBalance} ETH |{" "}
                                            {this.props.ratesUcdBalance} UCD
                                        </small>
                                    </p>
                                    <ButtonToolbar>
                                        <Button
                                            bsSize="small"
                                            onClick={
                                                this.handleRatesRefreshClick
                                            }
                                            disabled={
                                                this.props.isLoading ||
                                                !this.props.isConnected
                                            }
                                        >
                                            Refresh rates
                                        </Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={tokenUcdTitle}>
                                    <p>
                                        Total token supply:{" "}
                                        {this.props.tokenUcdTotalSupply} UCD
                                    </p>
                                    <p>
                                        ETH Reserve:{" "}
                                        {this.props.tokenUcdEthBalance} ETH
                                    </p>
                                    <p>
                                        UCD Reserve:{" "}
                                        {this.props.tokenUcdUcdBalance} UCD{" "}
                                    </p>
                                    <p>
                                        <small>
                                            Contract:{" "}
                                            {this.props.tokenUcdContract == null
                                                ? "No contract"
                                                : this.props.tokenUcdContract
                                                      .instance.address}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Owner: {this.props.tokenUcdOwner}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Decimals:{" "}
                                            {this.props.tokenUcdDecimals}{" "}
                                            (Decimals divider:{" "}
                                            {this.props.tokenUcdDecimalsDiv})
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            LoanManager:{" "}
                                            {this.props
                                                .tokenUcdLoanManagerAddress ==
                                            null
                                                ? "No contract"
                                                : this.props
                                                      .tokenUcdLoanManagerAddress}
                                        </small>
                                    </p>
                                    <ButtonToolbar>
                                        <Button
                                            bsSize="small"
                                            onClick={
                                                this.handleTokenUcdRefreshClick
                                            }
                                            disabled={
                                                this.props.isLoading ||
                                                !this.props.isConnected
                                            }
                                        >
                                            Refresh info
                                        </Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={loanManagerTitle}>
                                    <p>
                                        ProductCount: {this.props.productCount}{" "}
                                    </p>
                                    <p>
                                        LoanCount: {this.props.loanCount}{" "}
                                    </p>
                                    <p>
                                        <small>
                                            Contract:{" "}
                                            {this.props.loanManagerContract ==
                                            null
                                                ? "No contract"
                                                : this.props.loanManagerContract
                                                      .instance.address}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Owner: {this.props.loanManagerOwner}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Balance:{" "}
                                            {this.props.loanManagerEthBalance}{" "}
                                            ETH |{" "}
                                            {this.props.loanManagerUcdBalance}{" "}
                                            UCD{" "}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            Rates contract:{" "}
                                            {this.props.loanManagerRatesContractAddress}
                                        </small>
                                    </p>
                                    <p>
                                        <small>
                                            TokenUcd contract:{" "}
                                            {
                                                this.props
                                                    .loanManagerTokenUcdContractAddress
                                            }
                                        </small>
                                    </p>
                                    <ButtonToolbar>
                                        <Button
                                            bsSize="small"
                                            onClick={
                                                this
                                                    .handleLoanManagerRefreshClick
                                            }
                                            disabled={
                                                this.props.isLoading ||
                                                !this.props.isConnected
                                            }
                                        >
                                            Refresh info
                                        </Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={productsTitle}>
                                    <ArrayDump
                                        items={this.props.loanProducts}
                                    />
                                </Panel>
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={4} md={4}>
                        <Panel header={availableAccountsTitle}>
                            <ArrayDump items={this.props.accounts} />
                        </Panel>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6} md={6}>
                        <Panel header={<h3>Loans for userAccount</h3>}>
                            <ArrayDump items={this.props.loans} />
                        </Panel>
                    </Col>
                </Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.ethBase.userAccount,
    accounts: state.ethBase.accounts,
    userAccountBal: state.userBalances.account,
    isLoading: state.ethBase.isLoading,
    isConnected: state.ethBase.isConnected,
    web3ConnectionId: state.ethBase.web3ConnectionId,
    web3Instance: state.ethBase.web3Instance,
    network: state.ethBase.network,

    ratesContract: state.rates.contract,
    ratesUcdBalance: state.rates.info.ucdBalance,
    ratesEthBalance: state.rates.info.ethBalance,
    ratesOwner: state.rates.info.owner,
    usdScale: state.rates.info.usdScale,
    ethUsdcRate: state.rates.info.ethUsdcRate,
    ethUsdRate: state.rates.info.ethUsdRate,

    tokenUcdContract: state.tokenUcd.contract,
    tokenUcdOwner: state.tokenUcd.info.owner,
    tokenUcdDecimals: state.tokenUcd.info.decimals,
    tokenUcdDecimalsDiv: state.tokenUcd.info.decimalsDiv,
    tokenUcdUcdBalance: state.tokenUcd.info.ucdBalance,
    tokenUcdEthBalance: state.tokenUcd.info.ethBalance,
    tokenUcdTotalSupply: state.tokenUcd.info.totalSupply,
    tokenUcdLoanManagerAddress: state.tokenUcd.info.loanManagerAddress,

    loanManagerContract: state.loanManager.contract,
    loanManagerOwner: state.loanManager.info.owner,
    loanManagerEthBalance: state.loanManager.info.ethBalance,
    loanManagerUcdBalance: state.loanManager.info.ucdBalance,
    loanCount: state.loanManager.info.loanCount,
    productCount: state.loanManager.info.productCount,
    loanManagerRatesContractAddress: state.loanManager.info.ratesAddress,
    loanManagerTokenUcdContractAddress: state.loanManager.info.tokenUcdAddress,
    loanProducts: state.loanManager.products,

    loans: state.loans.loans
});

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            setupWeb3,
            fetchUserBalance,
            refreshRates,
            refreshTokenUcd,
            refreshLoanManager
        },
        dispatch
    );

export default connect(mapStateToProps, mapDispatchToProps)(underTheHood);
