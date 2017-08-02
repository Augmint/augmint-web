import React from 'react'
import { connect } from 'react-redux'
import {Grid, Row, Col, Jumbotron, Panel} from 'react-bootstrap'
import AccountInfo from '../../components/AccountInfo'

//const myAccountTitle = ( <h3>My UCD Account</h3> );
const myLoansTitle = ( <h3>My UCD Loans</h3> );

class Home extends React.Component {

    render () {
        console.log( "Render this.state.userAccount:", this.props.userAccount)
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

                    <Col xs={4} md={4}>
                        <Panel header={myLoansTitle}>
                            <p>TODO</p>
                        </Panel>
                    </Col>
                </Row>
            </Grid>
        )
    }
}

const mapStateToProps = state => ({
    userAccount: state.balances.account
})

export default connect(
    mapStateToProps
)(Home)
