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

const stringify = stringifier({ maxDepth: 3, indent: "   " });

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

function ContractBaseInfo(props) {
    let { isConnected, isLoading, error, contract } = props.contract;
    return (
        <Table condensed striped>
            <tbody>
                <tr>
                    <td colSpan="2">
                        <small>
                            Contract:<br />
                            {contract == null
                                ? "No contract"
                                : contract.instance.address}
                        </small>
                    </td>
                </tr>
                <tr>
                    <td>
                        {isConnected ? "connected" : "not connected"}
                    </td>
                    <td>
                        {isLoading ? "Loanding..." : "not Loading"}
                    </td>
                </tr>
                <tr>
                    <td colSpan="2">
                        {error
                            ? <pre style={{ fontSize: 10 + "px" }}>
                                  stringify(error)
                              </pre>
                            : "No error"}
                    </td>
                </tr>
            </tbody>
        </Table>
    );
}

class underTheHood extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            providerInfoOpen: false
        };
    }

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
                                <Panel header={<h3>Web3 connection</h3>}>
                                    <p>
                                        {this.props.isConnected
                                            ? "connected"
                                            : "not connected"}
                                    </p>
                                    <p>
                                        Network: {this.props.network.name} Id:{" "}
                                        {this.props.network.id}
                                    </p>
                                    <p>
                                        Internal Connection Id:{" "}
                                        {this.props.web3ConnectionId}
                                    </p>
                                    <div>
                                        <Button
                                            bsStyle="link"
                                            onClick={() =>
                                                this.setState({
                                                    providerInfoOpen: !this
                                                        .state.providerInfoOpen
                                                })}
                                        >
                                            {this.state.providerInfoOpen
                                                ? "<< Hide provider info"
                                                : "Show Provider info >>"}
                                        </Button>
                                        <Panel
                                            collapsible
                                            expanded={
                                                this.state.providerInfoOpen
                                            }
                                        >
                                            <pre
                                                style={{ fontSize: 10 + "px" }}
                                            >
                                                {this.props.web3Instance
                                                    ? stringify(
                                                          this.props
                                                              .web3Instance
                                                              .currentProvider
                                                      )
                                                    : "No web3 Instance"}
                                            </pre>
                                        </Panel>
                                    </div>

                                    <Button
                                        bsSize="small"
                                        onClick={this.props.setupWeb3}
                                    >
                                        Reconnect web3
                                    </Button>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={<h3>User Account</h3>}>
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
                                <Panel header={<h3>Rates contract</h3>}>
                                    <p>
                                        ETH/USD:{" "}
                                        {this.props.ratesInfo.ethUsdRate}
                                    </p>

                                    <ContractBaseInfo
                                        contract={this.props.rates}
                                    />

                                    <pre style={{ fontSize: 10 + "px" }}>
                                        {stringify(this.props.ratesInfo)}
                                    </pre>

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
                                <Panel header={<h3>TokenUcd contract</h3>}>
                                    <p>
                                        Total token supply:{" "}
                                        {this.props.tokenUcdInfo.totalSupply}{" "}
                                        UCD
                                    </p>
                                    <p>
                                        ETH Reserve:{" "}
                                        {this.props.tokenUcdInfo.ethBalance} ETH
                                    </p>
                                    <p>
                                        UCD Reserve:{" "}
                                        {this.props.tokenUcdInfo.ucdBalance} UCD{" "}
                                    </p>
                                    <ContractBaseInfo
                                        contract={this.props.tokenUcd}
                                    />
                                    <pre style={{ fontSize: 10 + "px" }}>
                                        {stringify(this.props.tokenUcdInfo)}
                                    </pre>
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
                                <Panel header={<h3>LoanManager contract</h3>}>
                                    <p>
                                        LoanCount:{" "}
                                        {this.props.loanManagerInfo.loanCount}{" "}
                                    </p>
                                    <ContractBaseInfo
                                        contract={this.props.loanManager}
                                    />
                                    <pre style={{ fontSize: 10 + "px" }}>
                                        {stringify(this.props.loanManagerInfo)}
                                    </pre>
                                    <ButtonToolbar>
                                        <Button
                                            bsSize="small"
                                            onClick={
                                                this
                                                    .handleLoanManagerRefreshClick
                                            }
                                            disabled={
                                                this.props.loanManager.isLoading
                                            }
                                        >
                                            Refresh info
                                        </Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={<h3>Loan Products</h3>}>
                                    <ArrayDump
                                        items={this.props.loanProducts}
                                    />
                                </Panel>
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={4} md={4}>
                        <Panel header={<h3>Accounts</h3>}>
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

    rates: state.rates,
    ratesContract: state.rates.contract,
    ratesInfo: state.rates.info,

    tokenUcd: state.tokenUcd,
    tokenUcdContract: state.tokenUcd.contract,
    tokenUcdInfo: state.tokenUcd.info,

    loanManager: state.loanManager,
    loanManagerContract: state.loanManager.contract,
    loanManagerInfo: state.loanManager.info,
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
