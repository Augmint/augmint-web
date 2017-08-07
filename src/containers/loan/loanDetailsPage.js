/*
    TODO: make loan loading and error handling to a common component (use here and on repay loan page)
*/
import React from "react";
import { connect } from "react-redux";
import LoanDetails from "components/LoanDetails";
import { ErrorPanel } from "components/MsgPanels";
import { PageHeader, Grid, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

// TODO: push browser history on submit success (check: https://github.com/ReactTraining/react-router/issues/3903 )

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
            <Grid>
                <Row>
                    <Col>
                        <PageHeader>Loan details</PageHeader>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {this.state.isLoading &&
                            <p>
                                Fetching data (loan id: {this.state.loanId})...
                            </p>}

                        {!this.state.isLoading &&
                            !this.state.isLoanFound &&
                            <ErrorPanel
                                header={
                                    <h3>
                                        Can't find loan #{this.state.loanId} for current account{" "}
                                        {this.props.userAccount}
                                    </h3>
                                }
                            />}

                        {this.state.isLoanFound &&
                            <LoanDetails loan={this.state.loan} />
                        }

                        {  this.state.isLoanFound &&  this.state.loan.isDue &&
                                    <Link
                                        key={"repaybtn-" + this.state.loan.loanId}
                                        className="btn btn-primary"
                                        to={`/loan/repay/${this.state.loan.loanId}`}
                                    >
                                        Repay
                                    </Link>}

                    </Col>
                </Row>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    loans: state.loans.loans,
    userAccount: state.ethBase.userAccount
});

export default (LoanDetailsPage = connect(mapStateToProps)(LoanDetailsPage));
