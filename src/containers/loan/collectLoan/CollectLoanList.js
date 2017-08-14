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
import { Form } from "components/BaseComponents";

class CollectLoanList extends React.Component {
    async handleSubmit(values) {
        //values.preventDefault();
        let res = await store.dispatch(collectLoans(this.props.loansToCollect));
        store.dispatch(fetchLoansToCollect());

        if (res.type !== LOANMANAGER_COLLECT_SUCCESS) {
            throw new SubmissionError({
                _error: {
                    title: "Ethereum transaction failed",
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

    constructor(props) {
        super(props);
        this.state = {
            loansToCollect: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        // needed when landing from Link within App
        if (this.props.loanManager) {
            store.dispatch(fetchLoansToCollect());
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            this.props.loanManager &&
            prevProps.loanManager !== this.props.loanManager
        ) {
            // loanManager mounted
            store.dispatch(fetchLoansToCollect());
        }
    }

    render() {
        const {
            error,
            submitSucceeded,
            handleSubmit,
            clearSubmitErrors,
            isLoading,
            submitting,
            loansToCollect
        } = this.props;
        return (
            <Col>
                <Col xs={12} md={4}>
                    <Well>
                        .... TODO some description (and make this break on small
                        devices properly) ...
                    </Well>
                </Col>
                <Col xs={12} md={8}>
                    {error &&
                        <EthSubmissionErrorPanel
                            error={error}
                            header="Failed to collect all loans."
                            onDismiss={() => clearSubmitErrors()}
                        >
                            <p>One or more loan collection has failed.</p>{" "}
                        </EthSubmissionErrorPanel>}

                    {!submitSucceeded &&
                        !isLoading &&
                        loansToCollect != null &&
                        <Form onSubmit={handleSubmit(this.handleSubmit)}>
                            <Button
                                type="submit"
                                bsStyle="primary"
                                disabled={submitting}
                            >
                                {submitting ? "Submitting..." : "Collect all"}
                            </Button>
                        </Form>}

                    {submitSucceeded &&
                        <EthSubmissionSuccessPanel
                            header={
                                <h3>
                                    Successful collection of{" "}
                                    {this.state.result.loansCollected} loans
                                </h3>
                            }
                            eth={this.state.result.eth}
                        />}

                    {(isLoading || loansToCollect == null) &&
                        <p>Refreshing list of loans to collect...</p>}
                    <LoanList
                        header={<h2>Loans to collect</h2>}
                        noItemMessage={
                            <p>No defaulted and uncollected loan.</p>
                        }
                        loans={loansToCollect}
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
