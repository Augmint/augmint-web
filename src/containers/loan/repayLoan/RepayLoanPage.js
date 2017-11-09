/*
    TODO: check here of user account ACD balance is enough for repayment
*/
import React from "react";
import { connect } from "react-redux";
import { Pgrid } from "components/PageLayout";
import { Button } from "semantic-ui-react";
import store from "modules/store";
import {
    repayLoan,
    LOANMANAGER_REPAY_SUCCESS
} from "modules/reducers/loanManager";
import LoanDetails from "containers/loan/components/LoanDetails";
import AccountInfo from "components/AccountInfo";
import { SubmissionError, reduxForm } from "redux-form";
import {
    EthSubmissionErrorPanel,
    ErrorPanel,
    EthSubmissionSuccessPanel,
    WarningPanel,
    LoadingPanel
} from "components/MsgPanels";
import { Form } from "components/BaseComponents";
import { RepayHelp } from "./components/RepayHelp";

// TODO: push browser history on submit success (check: https://github.com/ReactTraining/react-router/issues/3903 )
//import { push } from 'react-router-redux'
//import { Route, Redirect } from 'react-router-dom';

function LoanDetailsWithStatusCheck(props) {
    const loan = props.loan;
    let msg;

    if (loan.loanState === 0) {
        msg = (
            <WarningPanel header="Can't repay">
                This loan is not yet due
                <br />(loan id: {loan.loanId}){" "}
            </WarningPanel>
        );
    } else if (loan.loanState !== 5) {
        msg = (
            <WarningPanel header="Can't repay">
                This loan is in "{loan.loanStateText}" status. <br />
                (Loan id: {loan.loanId}){" "}
            </WarningPanel>
        );
    }

    return (
        <div>
            {msg}
            <h4>Selected Loan</h4>
            <LoanDetails loan={loan} />
        </div>
    );
}

class RepayLoanPage extends React.Component {
    constructor(props) {
        super(props);
        let loanId = parseInt(this.props.match.params.loanId, 10);
        this.state = {
            loan: null,
            loanId: loanId,
            isLoading: true
        };
        this.handleSubmit = this.handleSubmit.bind(this);
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

    async handleSubmit(values) {
        //values.preventDefault();
        let res = await store.dispatch(repayLoan(this.state.loanId));
        if (res.type !== LOANMANAGER_REPAY_SUCCESS) {
            throw new SubmissionError({
                _error: {
                    title: "Ethereum transaction Failed",
                    details: res.error,
                    eth: res.eth
                }
            });
        } else {
            this.setState({
                result: res.result
            });
            return;
        }
    }

    render() {
        const { submitSucceeded, clearSubmitErrors } = this.props;

        if (this.state.isLoading) {
            return (
                <LoadingPanel>
                    Fetching data (loan id: {this.state.loanId})...
                </LoadingPanel>
            );
        }

        if (!this.state.isLoanFound) {
            return (
                <ErrorPanel
                    header={
                        <h3>
                            Can't find loan #{this.state.loanId} for current
                            account {this.props.userAccount.address}
                        </h3>
                    }
                />
            );
        }

        return (
            <Pgrid columns={2}>
                <Pgrid.Column width={6}>
                    <AccountInfo account={this.props.userAccount} />
                    <RepayHelp />
                </Pgrid.Column>
                <Pgrid.Column width={10}>
                    {this.props.error && (
                        <EthSubmissionErrorPanel
                            error={this.props.error}
                            header={<h3>Repay failed</h3>}
                            onDismiss={() => clearSubmitErrors()}
                        />
                    )}

                    {!submitSucceeded &&
                        !this.state.isLoading && (
                            <Form
                                onSubmit={this.props.handleSubmit(
                                    this.handleSubmit
                                )}
                            >
                                <LoanDetailsWithStatusCheck
                                    loan={this.state.loan}
                                />
                                <Button
                                    primary
                                    size="big"
                                    disabled={
                                        this.props.submitting ||
                                        !this.state.isLoanFound ||
                                        this.state.loan.loanState !== 5
                                    }
                                >
                                    {this.props.submitting
                                        ? "Submitting..."
                                        : "Confirm to repay " +
                                          this.state.loan.ucdDueAtMaturity +
                                          " ACD"}
                                </Button>
                            </Form>
                        )}

                    {submitSucceeded && (
                        <EthSubmissionSuccessPanel
                            header={<h3>Successful repayment</h3>}
                            eth={this.state.result.eth}
                            dismissable={false}
                        />
                    )}
                </Pgrid.Column>
            </Pgrid>
        );
    }
}

const mapStateToProps = state => ({
    loans: state.loans.loans,
    userAccount: state.userBalances.account
});

RepayLoanPage = connect(mapStateToProps)(RepayLoanPage);

export default reduxForm({
    form: "RepayLoanPage" // a unique identifier for this form
})(RepayLoanPage);
