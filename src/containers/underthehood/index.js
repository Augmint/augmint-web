/* TODO: split panels into components */
import React from 'react'
import { bindActionCreators } from 'redux' // TODO: do we really need this or shall we use the store directly?
import { connect } from 'react-redux'
import {
    setupWeb3,
    refreshBalance
} from '../../modules/ethBase'
import {refreshRates} from '../../modules/rates'
import {refreshTokenUcd} from '../../modules/tokenUcd'
import {refreshLoanManager} from '../../modules/loanManager'
import { ButtonToolbar, Button, Grid, Row, Col, Panel, Table, PageHeader} from 'react-bootstrap';

import store from '../../store' /// for debug

const web3Title = ( <h3>Web3 connection</h3> );
const userAccountTitle = ( <h3>User Account</h3> );
const availableAccountsTitle = ( <h3>Accounts</h3> );
const ratesTitle = ( <h3>Rates contract</h3> );
const tokenUcdTitle = ( <h3>TokenUcd contract</h3> );
const loanManagerTitle = ( <h3>LoanManager contract</h3> );
const productsTitle = ( <h3>Loan Products</h3> );

function AccountList(props) {
    const accounts = props.accounts;
    const listItems = accounts.map( (number, index) =>
        <tr key={number}><td ><small>[{index}] {number}</small></td></tr>
    );
    return (
        <Table condensed striped>
            <tbody>
                {listItems}
            </tbody>
        </Table>
    );
}

function ProductList(props) {
    const products = props.products;
    const listItems = products.map( (prod, index) =>
        <tr key={index}><td className="white-space:pre-wrap"><small>[{index}] {JSON.stringify(prod, null, 4)}</small></td></tr>
    );
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

    handleLoanManagerRefreshClick = e => {
        e.preventDefault()
        this.props.refreshLoanManager();
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
                                    <p>USD/WEI: {this.props.usdWeiRate} </p>
                                    <p>ETH/USD: {this.props.ethUsdRate}</p>
                                    <p>USD/ETH: {this.props.usdEthRate} </p>
                                    <p><small>Contract: { this.props.ratesContract == null ? "No contract" :  this.props.ratesContract.instance.address }</small></p>
                                    <p><small>Owner: { this.props.ratesOwner}</small></p>
                                    <p><small>Balance: { this.props.ratesBalance } ETH</small></p>
                                    <ButtonToolbar>
                                        <Button bsSize="small" onClick={this.handleRatesRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh rates</Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={tokenUcdTitle}>
                                    <p>Total token supply: {this.props.tokenUcdTotalSupply} UCD</p>
                                    <p>ETH Reserve: {this.props.tokenUcdEthBalance} ETH</p>
                                    <p>UCD Reserve: {this.props.tokenUcdUcdBalance} UCD </p>
                                    <p><small>Contract: { this.props.tokenUcdContract == null ? "No contract" :  this.props.tokenUcdContract.instance.address }</small></p>
                                    <p><small>Owner: { this.props.tokenUcdOwner}</small></p>
                                    <p><small>Decimals: {this.props.tokenUcdDecimals} (Decimals divider: {this.props.tokenUcdDecimalsDiv})</small></p>
                                    <p><small>LoanManager: { this.props.tokenUcdLoanManagerAddress == null ? "No contract" :  this.props.tokenUcdLoanManagerAddress }</small></p>
                                    <ButtonToolbar>
                                        <Button bsSize="small" onClick={this.handleTokenUcdRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh info</Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                        </Row>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={loanManagerTitle}>
                                    <p>ProductCount: {this.props.productCount} </p>
                                    <p>LoanCount: {this.props.loanCount} </p>
                                    <p><small>Contract: { this.props.loanManagerContract == null ? "No contract" :  this.props.ratesContract.instance.address }</small></p>
                                    <p><small>Owner: { this.props.loanManagerOwner}</small></p>
                                    <p><small>Balance: { this.props.loanManagerBalance } ETH</small></p>
                                    <p><small>Rates contract: { this.props.loanManagerRatesContractAddress }</small></p>
                                    <p><small>TokenUcd contract: { this.props.loanManagerTokenUcdContractAddress }</small></p>
                                    <ButtonToolbar>
                                        <Button bsSize="small" onClick={this.handleLoanManagerRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh info</Button>
                                    </ButtonToolbar>
                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={productsTitle}>
                                    <ProductList products={this.props.loanProducts} />
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
    ratesBalance: state.rates.balance,
    ratesOwner: state.rates.owner,
    usdWeiRate: state.rates.usdWeiRate,
    usdEthRate: state.rates.usdEthRate,
    ethUsdRate: state.rates.ethUsdRate,

    tokenUcdContract: state.tokenUcd.contract,
    tokenUcdOwner: state.tokenUcd.owner,
    tokenUcdDecimals: state.tokenUcd.decimals,
    tokenUcdDecimalsDiv: state.tokenUcd.decimalsDiv,
    tokenUcdUcdBalance: state.tokenUcd.ucdBalance,
    tokenUcdEthBalance: state.tokenUcd.balance,
    tokenUcdTotalSupply: state.tokenUcd.totalSupply,
    tokenUcdLoanManagerAddress: state.tokenUcd.loanManagerAddress,

    loanManagerContract: state.loanManager.contract,
    loanManagerOwner: state.loanManager.owner,
    loanManagerBalance: state.loanManager.balance,
    loanCount: state.loanManager.loanCount,
    productCount: state.loanManager.productCount,
    loanManagerRatesContractAddress: state.loanManager.ratesAddress,
    loanManagerTokenUcdContractAddress: state.loanManager.tokenUcdAddress,
    loanProducts: state.loanManager.products

})

const mapDispatchToProps = dispatch => bindActionCreators({
    setupWeb3,
    refreshBalance,
    refreshRates,
    refreshTokenUcd,
    refreshLoanManager
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(underTheHood)
