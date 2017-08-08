import React from "react";
import { connect } from "react-redux";
import LoanList from "components/LoanList";
import { Row, Col, Well, Clearfix } from "react-bootstrap";

class LoanSelector extends React.Component {
    render() {
        return (
            <Row>
                <Col xs={12} md={4}>
                    <Well>
                        .... TODO some description (and make this break on small
                        devices properly) ...
                    </Well>
                </Col>
                <Clearfix visibleSmBlock />
                <Col xs={12} md={8}>
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
