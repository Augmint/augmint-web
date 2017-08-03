import React from 'react'
import { bindActionCreators } from 'redux' // TODO: do we really need this or shall we use the store directly?
import { connect } from 'react-redux'
import {refreshTokenUcd} from '../../modules/tokenUcd'
import { Grid, Row, Col, Panel, PageHeader} from 'react-bootstrap';

const baseInfoTitle = ( <h3>Base Info</h3> );
const reservesTitle = ( <h3>Reserves</h3> );

class TokenUcd extends React.Component {

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
                            Token UCD
                        </PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col xs={8} md={8}>
                        <Row>
                            <Col xs={6} md={6}>
                                <Panel header={baseInfoTitle}>
                                    <p>Total token supply: {this.props.tokenUcdTotalSupply} UCD</p>

                                </Panel>
                            </Col>
                            <Col xs={6} md={6}>
                                <Panel header={reservesTitle}>

                                    <p>ETH Reserve: {this.props.tokenUcdEthBalance} ETH
                                        ({this.props.usdEthRate * this.props.tokenUcdEthBalance} USD)</p>
                                    <p>UCD Reserve: {this.props.tokenUcdUcdBalance} UCD </p>

                                </Panel>
                            </Col>
                        </Row>
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
    tokenUcdEthBalance: state.tokenUcd.ethBalance,
    tokenUcdTotalSupply: state.tokenUcd.totalSupply,
    loanManagerAddress: state.tokenUcd.loanManagerAddress

})

const mapDispatchToProps = dispatch => bindActionCreators({
    refreshTokenUcd
}, dispatch)

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TokenUcd)
