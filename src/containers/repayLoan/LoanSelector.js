import React from 'react'
import { connect } from 'react-redux'
import LoanList from '../../components/LoanList'
import { Well, Row, Col} from 'react-bootstrap';
import { Link } from 'react-router-dom'

function SelectLoanButton (props) {
    return(
        <Link key={props.loanId} className="btn btn-primary" to={`/loan/repay/${props.loanId}`}>
            Repay Loan
        </Link>)
    }

    class LoanSelector extends React.Component {

        render() {
            return(
                <Row>
                    <Col xs={4} md={4}>
                        <Well>
                            .... TODO some description ...
                        </Well>
                    </Col>
                    <Col xs={8} md={8}>
                        <LoanList header={<h2>Select your loan to repay</h2>}
                            noItemMessage={<p>None of your loans is due currently.</p>}
                            loans={this.props.loans}
                            filter={(item) => { return item.isDue} }
                            selectComponent={SelectLoanButton} />
                    </Col>
                </Row>
            )
        }
    }

    const mapStateToProps = state => ({
        userAccount: state.userBalances.account,
        loans: state.loans.loans
    })

    export default connect(
        mapStateToProps
    )(LoanSelector)
