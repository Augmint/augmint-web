import React from "react";
import { connect } from "react-redux";
import { Grid, Row, Col, PageHeader } from "react-bootstrap";
import tokenUcdProvider from "modules/tokenUcdProvider";
import loanManagerProvider from "modules/loanManagerProvider";
import AccountInfo from "components/AccountInfo";
import LoanList from "components/LoanList";
import UcdTransferForm from "./UcdTransferForm";
import TransferList from "components/TransferList";

class AccountHome extends React.Component {
    componentDidMount() {
        loanManagerProvider();
        tokenUcdProvider();
    }
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
                        <Col xs={12}>
                            <TransferList
                                transfers={this.props.userTransfers}
                                userAccountAddress={
                                    this.props.userAccount.address
                                }
                            />
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
    loans: state.loans.loans,
    userTransfers: state.userTransfers
});

export default connect(mapStateToProps)(AccountHome);
