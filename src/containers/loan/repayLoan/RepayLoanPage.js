/*
    TODO: check here of user account A-EUR balance is enough for repayment
*/
import React from "react";
import { connect } from "react-redux";
import { Pblock, Pgrid } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import store from "modules/store";
import { repayLoan, LOANTRANSACTIONS_REPAY_SUCCESS } from "modules/reducers/loanTransactions";
import LoanDetails from "containers/loan/components/LoanDetails";
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

class RepayLoanPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loan: null,
            loanId: this.props.match.params.loanId,
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
            return item.id.toString() === this.state.loanId;
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
        let res = await store.dispatch(repayLoan(this.state.loan.repaymentAmount, this.state.loanId));
        if (res.type !== LOANTRANSACTIONS_REPAY_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result
            });
            return;
        }
    }

    render() {
        const { submitSucceeded, clearSubmitErrors, userAccount } = this.props;
        const loan = this.state.loan;

        if (this.state.isLoading) {
            return <LoadingPanel>Fetching data (loan id: {this.state.loanId})...</LoadingPanel>;
        }

        if (!this.state.isLoanFound) {
            return (
                <ErrorPanel
                    header={`Can't find loan #${this.state.loanId} for current account ${userAccount.address}`}
                />
            );
        }

        return (
            <Pgrid.Row wrap={false}>
                <Pgrid.Column size={6 / 17}>
                    <RepayHelp />
                </Pgrid.Column>
                <Pgrid.Column size={1 / 17} />
                <Pgrid.Column size={10 / 17}>
                    {this.props.error && (
                        <EthSubmissionErrorPanel
                            error={this.props.error}
                            header="Repay failed"
                            onDismiss={() => clearSubmitErrors()}
                        />
                    )}

                    {!submitSucceeded &&
                        !this.state.isLoading && (
                            <Pblock header="Selected Loan">
                                <Form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
                                    {loan.state !== 5 &&
                                        loan.state !== 0 && (
                                            <WarningPanel header="Can't repay">
                                                This loan is in "{loan.loanStateText}" status.
                                            </WarningPanel>
                                        )}
                                    <LoanDetails loan={loan} />

                                    {this.state.loan.isRepayable &&
                                        !this.state.loan.isDue && (
                                            <p>
                                                This loan is not due soon but you can repay early without any extra fee.
                                            </p>
                                        )}
                                    {this.state.loan.isRepayable && (
                                        <Button
                                            data-testid="confirmRepayButton"
                                            size="big"
                                            type="submit"
                                            disabled={
                                                this.props.submitting ||
                                                !this.state.isLoanFound ||
                                                !this.state.loan.isRepayable
                                            }
                                        >
                                            {this.props.submitting
                                                ? "Submitting..."
                                                : "Confirm to repay " + this.state.loan.repaymentAmount + " A-EUR"}
                                        </Button>
                                    )}
                                    {!this.state.loan.isRepayable && <p>This loan is not repayable anymore</p>}
                                </Form>
                            </Pblock>
                        )}

                    {submitSucceeded && (
                        <EthSubmissionSuccessPanel
                            header="Repayment submitted"
                            result={this.state.result}
                            dismissable={false}
                        />
                    )}
                </Pgrid.Column>
            </Pgrid.Row>
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
