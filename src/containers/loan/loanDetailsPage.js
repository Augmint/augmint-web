/*
    TODO: clean up this
*/
import React from "react";
import { connect } from "react-redux";
import LoanDetails from "./components/LoanDetails";
import Header from "../../components/augmint-ui/header";
import { Pheader, Psegment, Pgrid } from "components/PageLayout";
import { LoadingPanel, ErrorPanel } from "components/MsgPanels";
import { LoanRepayLink } from "./components/LoanRepayLink";
import CollectLoanButton from "./collectLoan/CollectLoanButton";

class LoanDetailsPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loan: null,
            loanId: this.props.match.params.loanId,
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
        const loan = this.props.loans.find(item => {
            return item.id === Number(this.state.loanId);
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
                {this.state.isLoading && <LoadingPanel>Fetching data (loan id: {this.state.loanId})...</LoadingPanel>}
                {!this.state.isLoading &&
                    !this.state.isLoanFound && (
                        <ErrorPanel>
                            Can't find loan #{this.state.loanId} for current account {this.props.userAccount}
                        </ErrorPanel>
                    )}

                {this.state.isLoanFound && (
                    <Pgrid>
                        <Pgrid.Row wrap={false}>
                            <Pgrid.Column size={1 / 2}>
                                <Header>
                                    {this.state.loan.loanStateText} loan #{this.state.loan.loanId}
                                </Header>
                                <LoanDetails loan={this.state.loan} />

                                <LoanRepayLink loan={this.state.loan} size="large" />

                                {this.state.loan.isCollectable && (
                                    <CollectLoanButton
                                        loanManager={this.props.loanManager}
                                        loansToCollect={[{ id: this.state.loan.id }]}
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
    loanManager: state.loanManager,
    userAccount: state.web3Connect.userAccount
});

export default (LoanDetailsPage = connect(mapStateToProps)(LoanDetailsPage));
