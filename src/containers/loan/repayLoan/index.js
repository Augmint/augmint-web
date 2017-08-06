import React from "react";
import { connect } from "react-redux";
import LoanList from "../../../components/LoanList";
import { PageHeader, Grid, Row, Col, Well } from "react-bootstrap";
import { Link } from "react-router-dom";

function SelectLoanButton(props) {
    return (
        <Link
            key={props.loanId}
            className="btn btn-primary"
            to={`/loan/${props.loanId}/repay`}
        >
            Select loan to repay
        </Link>
    );
}

class LoanSelector extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>Repay your loan</PageHeader>
                    </Col>
                </Row>

                <Row>
                    <Col xs={4} md={4}>
                        <Well>.... TODO some description ...</Well>
                    </Col>
                    <Col xs={8} md={8}>
                        <LoanList
                            header={<h2>Select your loan to repay</h2>}
                            noItemMessage={
                                <p>None of your loans is due currently.</p>
                            }
                            loans={this.props.loans}
                            filter={item => {
                                return item.isDue;
                            }}
                            selectComponent={SelectLoanButton}
                        />
                    </Col>
                </Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    userAccount: state.userBalances.account,
    loans: state.loans.loans
});

export default connect(mapStateToProps)(LoanSelector);
