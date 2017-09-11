/*
    TODO: make loan loading and error handling to a common component (use here and on repay loan page)
*/
import React from "react";
import { connect } from "react-redux";
import LoanDetails from "./components/LoanDetails";
import { Link } from "react-router-dom";
import { Header, Button } from "semantic-ui-react";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { LoadingPanel, ErrorPanel } from "components/MsgPanels";

class LoanDetailsPage extends React.Component {
    constructor(props) {
        super(props);
        let loanId = parseInt(this.props.match.params.loanId, 10);
        this.state = {
            loan: null,
            loanId: loanId,
            isLoading: true
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.loans !== this.props.loans) {
            this.setLoan(); // needed when landing from on URL directly
        }
    }

    componentDidMount() {
        this.setLoan(); // needed when landing from Link within App
    }

    setLoan() {
        // workaround b/c landing directly on URL and from LoanSelector triggers different events.
        if (this.props.loans == null) {
            return;
        } // not loaded yet
        let isLoanFound;
        let loan = this.props.loans.find(item => {
            return item.loanId === this.state.loanId;
        });
        if (typeof loan === "undefined") {
            isLoanFound = false;
        } else {
            isLoanFound = true;
        }
        this.setState({
            isLoading: false,
            loan: loan,
            isLoanFound: isLoanFound
        });
    }

    render() {
        return (
            <Psegment>
                <Pheader header="Loan details" />
                {this.state.isLoading && (
                    <LoadingPanel>
                        Fetching data (loan id: {this.state.loanId})...
                    </LoadingPanel>
                )}
                {!this.state.isLoading &&
                !this.state.isLoanFound && (
                    <ErrorPanel>
                        Can't find loan #{this.state.loanId} for current account{" "}
                        {this.props.userAccount}
                    </ErrorPanel>
                )}

                {this.state.isLoanFound && (
                    <Pgrid>
                        <Pgrid.Row columns={2}>
                            <Pgrid.Column>
                                <Header>
                                    {this.state.loan.loanStateText} loan #{this.state.loan.loanId}
                                </Header>
                                <LoanDetails loan={this.state.loan} />

                                {this.state.loan.isDue && (
                                    <Button
                                        content="Repay"
                                        as={Link}
                                        to={`/loan/repay/${this.state.loan
                                            .loanId}`}
                                        labelPosition="right"
                                        icon="right chevron"
                                        primary
                                        size="large"
                                    />
                                )}
                            </Pgrid.Column>
                        </Pgrid.Row>
                    </Pgrid>
                )}
            </Psegment>
        );
    }
}

const mapStateToProps = state => ({
    loans: state.loans.loans,
    userAccount: state.web3Connect.userAccount
});

export default (LoanDetailsPage = connect(mapStateToProps)(LoanDetailsPage));
