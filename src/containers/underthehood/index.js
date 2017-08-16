/* TODO: split panels into components */
import React from "react";
import { bindActionCreators } from "redux"; // TODO: do we really need this or shall we use the store directly?
import { connect } from "react-redux";
import { setupWeb3 } from "modules/reducers/web3Connect";
import { fetchUserBalance } from "modules/reducers/userBalances";
import { refreshRates } from "modules/reducers/rates";
import { refreshTokenUcd } from "modules/reducers/tokenUcd";
import { refreshLoanManager } from "modules/reducers/loanManager";
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

import store from "modules/store"; /// for debug

const stringify = stringifier({ maxDepth: 3, indent: "   " });

function ArrayDump(props) {
    const items = props.items;

    if (items === null) {
        return <p>null</p>;
    }
    if (items.length === 0) {
        return <p>empty array</p>;
    }

    const listItems = items.map((item, index) =>
        <tr key={index}>
            <td>
                <pre style={{ fontSize: 10 + "px" }}>
                    [{index}] {stringify(item)}
                </pre>
            </td>
        </tr>
    );

    return (
        <Table condensed striped>
            <tbody>
                {listItems}
            </tbody>
        </Table>
    );
}

function ContractBaseInfo(props) {
    let { isConnected, isLoading, error, contract, info } = props.contract;
    return (
        <div>
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
                            {isLoading ? "Loanding..." : "not loading"}
                        </td>
                    </tr>
                </tbody>
            </Table>

            {error
                ? <p>
                      Error: <br />{" "}
                      <pre style={{ fontSize: 10 + "px" }}>
                          stringify(error)
                      </pre>
                  </p>
                : <p>No error</p>}

            <p>Info:</p>
            <pre style={{ fontSize: 10 + "px" }}>
                {stringify(info)}
            </pre>

            <Button
                bsSize="small"
                onClick={props.refreshCb}
                disabled={isLoading}
            >
                Refresh contract
            </Button>
        </div>
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
        this.props.fetchUserBalance(this.props.userAccount);
        console.log(store.getState());
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
                                            ? "connected - " +
                                              this.props.web3Instance
                                                  .currentProvider.constructor
                                                  .name
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
                                                : "Show provider info >>"}
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
                                        {this.props.rates.info.ethUsdRate}
                                    </p>

                                    <ContractBaseInfo
                                        contract={this.props.rates}
                                        refreshCb={this.handleRatesRefreshClick}
                                    />
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={<h3>TokenUcd contract</h3>}>
                                    <p>
                                        Total token supply:{" "}
                                        {this.props.tokenUcd.info.totalSupply}{" "}
                                        UCD
                                    </p>
                                    <p>
                                        ETH Reserve:{" "}
                                        {this.props.tokenUcd.info.ethBalance}{" "}
                                        ETH
                                    </p>
                                    <p>
                                        UCD Reserve:{" "}
                                        {this.props.tokenUcd.info.ucdBalance}{" "}
                                        UCD{" "}
                                    </p>
                                    <ContractBaseInfo
                                        contract={this.props.tokenUcd}
                                        refreshCb={
                                            this.handleTokenUcdRefreshClick
                                        }
                                    />
                                </Panel>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={<h3>LoanManager contract</h3>}>
                                    <p>
                                        LoanCount:{" "}
                                        {this.props.loanManager.info.loanCount}{" "}
                                    </p>
                                    <ContractBaseInfo
                                        contract={this.props.loanManager}
                                        refreshCb={
                                            this.handleLoanManagerRefreshClick
                                        }
                                    />
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
    userAccount: state.web3Connect.userAccount,
    accounts: state.web3Connect.accounts,
    userAccountBal: state.userBalances.account,
    isLoading: state.web3Connect.isLoading,
    isConnected: state.web3Connect.isConnected,
    web3ConnectionId: state.web3Connect.web3ConnectionId,
    web3Instance: state.web3Connect.web3Instance,
    network: state.web3Connect.network,

    rates: state.rates,
    tokenUcd: state.tokenUcd,
    loanManager: state.loanManager,
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
