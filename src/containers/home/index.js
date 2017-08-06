import React from 'react'
import { connect } from 'react-redux'
import {Grid, Row, Col, Jumbotron} from 'react-bootstrap'
import AccountInfo from 'components/AccountInfo'
import LoanList from 'components/LoanList'

class Home extends React.Component {

    render () {
        return(
            <Grid>
                <Row>
                    <Col>
                        <Jumbotron>
                            <h1>UCD Playground</h1>
                            <p>Hello UCD!</p>
                            <p>UCD is ...</p>
                        </Jumbotron>
                    </Col>
                </Row>

                <Row>
                    <Col xs={6} md={6}>
                        <AccountInfo title={<h2>My Account</h2>} account={this.props.userAccount}/>
                    </Col>

                    <Col xs={6} md={6}>
                        <LoanList header={<h3>My UCD Loans</h3>}
                            noItemMessage={<p>You have no loans</p>}
                            loans={this.props.loans}/>
                    </Col>
                </Row>
            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans.loans
})

export default connect(
    mapStateToProps
)(Home)
