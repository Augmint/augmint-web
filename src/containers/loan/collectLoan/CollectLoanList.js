import React from "react";
import { connect } from "react-redux";
import store from "store.js";
import LoanList from "components/LoanList";
import { Col, Well, Button } from "react-bootstrap";
import { SubmissionError, reduxForm } from "redux-form";
import {
    collectLoans,
    fetchLoansToCollect,
    LOANMANAGER_COLLECT_SUCCESS
} from "modules/loanManager";
import {
    EthSubmissionErrorPanel,
    EthSubmissionSuccessPanel
} from "components/MsgPanels";

class CollectLoanList extends React.Component {
    async handleSubmit(values) {
        //values.preventDefault();
        this.setState({ isSubmitting: true });
        let res = await store.dispatch(collectLoans(this.props.loansToCollect));
        store.dispatch(fetchLoansToCollect());

        if (res.type !== LOANMANAGER_COLLECT_SUCCESS) {
            throw new SubmissionError({
                _error: {
                    title: "Ethereum transaction Failed",
                    details: res.error,
                    eth: res.eth
                }
            });
        } else {
            this.setState({
                submitSucceeded: true,
                result: res.result
            });
            return;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            submitSucceeded: false,
            loansToCollect: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // needed when landing from Link within App
        if( this.props.loanManager  ) {
            store.dispatch(fetchLoansToCollect());
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if( this.props.loanManager  && prevProps.loanManager !== this.props.loanManager ) {
            // loanManager mounted
            store.dispatch(fetchLoansToCollect());
        }
    }

    render() {
        return (
            <Col>
                <Col xs={12} md={4}>
                    <Well>
                        .... TODO some description (and make this break on small
                        devices properly) ...
                    </Well>
                </Col>
                <Col xs={12} md={8}>
                    {this.props.error &&
                        <EthSubmissionErrorPanel error={this.props.error} />}

                    {!this.state.submitSucceeded &&
                        !this.props.isLoading  &&
                        <form
                            onSubmit={this.props.handleSubmit(
                                this.handleSubmit
                            )}
                        >
                            <Button
                                type="submit"
                                bsStyle="primary"
                                disabled={this.props.submitting}
                            >
                                Collect all
                            </Button>
                        </form>}

                    {this.state.submitSucceeded &&
                        <EthSubmissionSuccessPanel
                            header={
                                <h3>
                                    Successful collection of{" "}
                                    {this.props.loansToCollect.length} loans
                                </h3>
                            }
                            eth={this.state.result.eth}
                        />}

                    { this.props.isLoading &&
                        <p>Loading loans to collect...</p>
                    }
                    <LoanList
                        header={<h2>Loans to collect</h2>}
                        noItemMessage={
                            <p>
                                No defaulted and uncollected loan.
                            </p>
                        }
                        loans={this.props.loansToCollect}
                    />
                </Col>
            </Col>
        );
    }
}

const mapStateToProps = state => ({
    loansToCollect: state.loanManager.loansToCollect,
    loanManager: state.loanManager.contract,
    isLoading: state.loanManager.isLoading
});

CollectLoanList = connect(mapStateToProps)(CollectLoanList);

export default reduxForm({
    form: "CollectLoanForm" // a unique identifier for this form
})(CollectLoanList);
