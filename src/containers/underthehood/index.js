import React from 'react'
import { bindActionCreators } from 'redux' // TODO: do we really need this or shall we use the store directly?
import { connect } from 'react-redux'
import {
    setupWeb3,
    refreshBalance
} from '../../modules/ethBase'
import {refreshRates} from '../../modules/rates'
import { ButtonToolbar, Button, Grid, Row, Col, Panel} from 'react-bootstrap';

import store from '../../store' /// for debug

const web3Title = ( <h3>Web3 connection</h3> );
const userAccountTitle = ( <h3>User Account</h3> );
const availableAccountsTitle = ( <h3>Accounts</h3> );
const ratesTitle = ( <h3>Rates</h3> );

function AccountList(props) {
    const accounts = props.accounts;
    const listItems = accounts.map( (number, index) =>
    //<li key={number}>
    <span key={number}>{index}. {number} <br/></span>
    //</li>
);
return (
    <p>{listItems}</p>
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
        console.log(this.props.ratesContract);
    }

    render() {
        return(
            <Grid>
                <Row>
                    <Col>
                        <h1>Under the hood</h1>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6} md={4}>
                        <Panel header={web3Title}>
                            <p>Web3 is: {this.props.isConnected ? "connected" : "not connected" }</p>
                            <p>Provider: { this.props.web3Instance ? JSON.stringify(this.props.web3Instance.currentProvider) : "No web3 Instance"}</p>
                            <p>Web3 internal Connection Id: {this.props.web3ConnectionId}</p>
                            <Button onClick={this.props.setupWeb3} disabled={this.props.isLoading}>Reconnect web3</Button>
                        </Panel>
                    </Col>
                    <Col xs={6} md={4}>
                        <Panel header={userAccountTitle}>

                            <p>{this.props.userAccount}</p>
                            <p>Balance: {this.props.balance} ETH</p>
                            <ButtonToolbar>
                                <Button onClick={this.handleBalanceRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh balance</Button>
                            </ButtonToolbar>
                        </Panel>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6} md={4}>
                        <Panel header={ratesTitle}>

                            <p>{ this.props.ratesContract == null ? "No contract" :  this.props.ratesContract.instance.address }</p>
                            <p>USD/WEI rate: {this.props.usdWeiRate} </p>
                            <ButtonToolbar>
                                <Button onClick={this.handleRatesRefreshClick} disabled={this.props.isLoading || !this.props.isConnected}>Refresh rates</Button>
                            </ButtonToolbar>
                        </Panel>
                    </Col>
                    <Col xs={9} md={6}>
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
    usdWeiRate: state.rates.usdWeiRate
})

const mapDispatchToProps = dispatch => bindActionCreators({
    setupWeb3,
    refreshBalance,
    refreshRates
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(underTheHood)
