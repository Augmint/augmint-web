import React from "react";
import { connect } from "react-redux";
import { Grid, Row, Col, PageHeader } from "react-bootstrap";
import AccountInfo from "components/AccountInfo";
import LoanList from "components/LoanList";
import UcdTransferForm from "./UcdTransferForm";

class AccountHome extends React.Component {
    render() {
        return (
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>My Account</PageHeader>
                    </Col>
                </Row>

                <Row>
                    <Col xs={6}>
                        <Col xs={12}>
                            <AccountInfo
                                account={this.props.userAccount}
                                header={<h3>Overview</h3>}
                            />
                        </Col>
                        <Col xs={12}>
                            <UcdTransferForm />
                        </Col>
                    </Col>
                    <Col xs={6}>
                        <LoanList
                            header={<h3>My UCD Loans</h3>}
                            noItemMessage={<span>You have no loans</span>}
                            loans={this.props.loans}
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

export default connect(mapStateToProps)(AccountHome);
