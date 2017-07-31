import React from 'react'
import { bindActionCreators } from 'redux' // TODO: do we really need this or shall we use the store directly?
import { connect } from 'react-redux'
import {
    setupWeb3,
    refreshBalance
} from '../../modules/ethBase'
import {refreshRates} from '../../modules/rates'
import {refreshTokenUcd} from '../../modules/tokenUcd'
import { ButtonToolbar, Button, Grid, Row, Col, Panel, Table, PageHeader} from 'react-bootstrap';

import store from '../../store' /// for debug

const web3Title = ( <h3>Web3 connection</h3> );
const userAccountTitle = ( <h3>User Account</h3> );
const availableAccountsTitle = ( <h3>Accounts</h3> );
const ratesTitle = ( <h3>Rates contract</h3> );
const tokenUcdTitle = ( <h3>TokenUcd contract</h3> );

function AccountList(props) {
    const accounts = props.accounts;
    const listItems = accounts.map( (number, index) =>
        //<li key={number}>
        // <small>
        // <span key={number} >[{index}] {number}</span><br/>
        // </small>
        //</li>
        <tr><td key={number}><small>[{index}] {number}</small></td></tr>
    );
    return (
        <Table condensed>
            <tbody>
                {listItems}
            </tbody>
        </Table>
    );
}

class underTheHood extends React.Component {

    handleBalanceRefreshClick = e => {
        e.preventDefault()
        this.props.refreshBalance(this.props.userAccount);
        console.log(store.getState());
        //console.log(this.props.rates)
    }

    handleRatesRefreshClick = e => {
        e.preventDefault()
        this.props.refreshRates();
    }

    handleTokenUcdRefreshClick = e => {
        e.preventDefault()
        this.props.refreshTokenUcd();
    }

    render() {
        return(

            <Grid>
                <Row>
                    <Col>
                        <PageHeader>
                            Under the hood
                        </PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col xs={8} md={8}>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={web3Title}>
                                    <p>{this.props.isConnected ? "connected" : "not connected" }</p>
                                    <p>Provider: { this.props.web3Instance ? JSON.stringify(this.props.web3Instance.currentProvider) : "No web3 Instance"}</p>
                                    <p>Internal Connection Id: {this.props.web3ConnectionId}</p>
                                    <Button bsSize="small" onClick={this.props.setupWeb3} disabled={this.props.isLoading}>Reconnect web3</Button>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={userAccountTitle}>

                                    <p>{this.props.userAccount}</p>
                                    <p>Balance: {this.props.balance} ETH</p>
                                    <ButtonToolbar>
                                        <Button bsSize="small" onClick={this.handleBalanceRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh balance</Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={ratesTitle}>
                                    <p>{ this.props.ratesContract == null ? "No contract" :  this.props.ratesContract.instance.address }</p>
                                    <p>USD/WEI: {this.props.usdWeiRate} </p>
                                    <p>ETH/USD: {this.props.ethUsdRate}</p>
                                    <p>USD/ETH: {this.props.usdEthRate} </p>
                                    <ButtonToolbar>
                                        <Button bsSize="small" onClick={this.handleRatesRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh rates</Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={tokenUcdTitle}>
                                    <p>{ this.props.tokenUcdContract == null ? "No contract" :  this.props.tokenUcdContract.instance.address }</p>
                                    <p>ETH Reserve: {this.props.tokenUcdEthBalance} ETH</p>
                                    <p>UCD Reserve: {this.props.tokenUcdUcdBalance} UCD </p>

                                    <ButtonToolbar>
                                        <Button bsSize="small" onClick={this.handleTokenUcdRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh balances</Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                        </Row>
                    </Col>

                    <Col xs={4} md={4}>

                        <Panel header={availableAccountsTitle}>
                            <AccountList accounts={this.props.accounts} />

                        </Panel>
                    </Col>

                </Row>
            </Grid>
        )
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
    usdWeiRate: state.rates.usdWeiRate,
    usdEthRate: state.rates.usdEthRate,
    ethUsdRate: state.rates.ethUsdRate,

    tokenUcdContract: state.tokenUcd.contract,
    tokenUcdUcdBalance: state.tokenUcd.ucdBalance,
    tokenUcdEthBalance: state.tokenUcd.balance
})

const mapDispatchToProps = dispatch => bindActionCreators({
    setupWeb3,
    refreshBalance,
    refreshRates,
    refreshTokenUcd
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(underTheHood)
