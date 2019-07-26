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
import { Tsegment, Tblock } from "components/TextContent";
import { Link } from "react-router-dom";
import { MrCoinBuyLink } from "components/ExchangeLinks";
import { Tokens } from "@augmint/js";
import { AEUR } from "components/augmint-ui/currencies";

// TODO: push browser history on submit success (check: https://github.com/ReactTraining/react-router/issues/3903 )
//import { push } from 'react-router-redux'
//import { Route, Redirect } from 'react-router-dom';

class RepayLoanPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loan: null,
            loanId: this.props.match.params.loanId,
            loanManagerAddress: this.props.match.params.loanManagerAddress,
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
            return (
                item.id.toString() === this.state.loanId && item.loanManagerAddress === this.state.loanManagerAddress
            );
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
        let res = await store.dispatch(
            repayLoan(this.state.loan.repaymentAmount, this.state.loan, this.props.userAccount.address)
        );
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
            <Pgrid.Row>
                <Pgrid.Column size={{ mobile: 1, tablet: 1 / 2, desktop: 6 / 16 }}>
                    <RepayHelp />
                </Pgrid.Column>
                <Pgrid.Column style={{ marginTop: 5 }} size={{ mobile: 1, tablet: 1 / 2, desktop: 10 / 16 }}>
                    {this.props.error && (
                        <EthSubmissionErrorPanel
                            error={this.props.error}
                            header="Repay failed"
                            onDismiss={() => clearSubmitErrors()}
                        />
                    )}

                    {!submitSucceeded && !this.state.isLoading && (
                        <Pblock header="Selected Loan">
                            <Form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
                                {loan.state !== 5 && loan.state !== 0 && (
                                    <WarningPanel header="Can't repay">
                                        This loan is in "{loan.loanStateText}" status.
                                    </WarningPanel>
                                )}
                                <LoanDetails loan={loan} />

                                {this.state.loan.isRepayable && !this.state.loan.isDue && (
                                    <p>This loan is not due soon but you can repay early without any extra fee.</p>
                                )}
                                {this.state.loan.isRepayable &&
                                    (loan.repaymentAmount.lte(Tokens.of(userAccount.tokenBalance)) ? (
                                        this.props.submitting ? (
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
                                                Submitting...
                                            </Button>
                                        ) : (
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
                                                Confirm to repay: <AEUR amount={this.state.loan.repaymentAmount} />
                                            </Button>
                                        )
                                    ) : (
                                        <Tsegment style={{ padding: 0 }}>
                                            <p style={{ textAlign: "left" }}>
                                                You don't have enough A-EUR to repay this loan.
                                            </p>
                                            <Tblock header="Get A-EUR" headerStyle={"primaryColor"}>
                                                <p>
                                                    <Link to="/loan/new">Take a loan </Link> for leaving your ETH in
                                                    escrow and receive A-EUR.
                                                </p>
                                            </Tblock>

                                            <Tblock header="Buy A-EUR" headerStyle={"primaryColor"}>
                                                <p>
                                                    Buy A-EUR for ETH on <Link to="/exchange">Augmint's exchange</Link>.
                                                </p>
                                                <p>
                                                    Buy A-EUR for fiat EUR on{" "}
                                                    <MrCoinBuyLink web3Connect={this.props.web3Connect}>
                                                        MrCoin.eu
                                                    </MrCoinBuyLink>
                                                    ,{/* Buy A-EUR for fiat EUR on MrCoin.eu, */}
                                                    our partner exchange.
                                                </p>
                                            </Tblock>
                                        </Tsegment>
                                    ))}
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
    userAccount: state.userBalances.account,
    web3Connect: state.web3Connect
});

RepayLoanPage = connect(mapStateToProps)(RepayLoanPage);

export default reduxForm({
    form: "RepayLoanPage" // a unique identifier for this form
})(RepayLoanPage);
