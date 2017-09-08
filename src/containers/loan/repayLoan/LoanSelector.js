import React from "react";
import { connect } from "react-redux";
import LoanList from "containers/loan/components/LoanList";
import { Row, Col } from "react-bootstrap";
import { RepayHelp } from "./components/RepayHelp";

class LoanSelector extends React.Component {
    render() {
        return (
            <Row>
                <Col xs={12} sm={4}>
                    <RepayHelp />
                </Col>
                <Col xs={12} sm={8}>
                    <LoanList
                        header={<h2>Select your loan to repay</h2>}
                        noItemMessage={
                            <p>None of your loans is due currently.</p>
                        }
                        loans={this.props.loans}
                        filter={item => {
                            return item.isDue;
                        }}
                    />
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans.loans
});

export default connect(mapStateToProps)(LoanSelector);
