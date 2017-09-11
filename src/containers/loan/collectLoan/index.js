import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import LoanList from "containers/loan/components/LoanList";
import { Psegment, Pheader, Pgrid } from "components/PageLayout";
import { Message, Button } from "semantic-ui-react";
import { LoadingPanel } from "components/MsgPanels";
import { SubmissionError, reduxForm } from "redux-form";
import {
    collectLoans,
    fetchLoansToCollect,
    LOANMANAGER_COLLECT_SUCCESS
} from "modules/reducers/loanManager";
import {
    EthSubmissionErrorPanel,
    EthSubmissionSuccessPanel
} from "components/MsgPanels";
import { Form } from "components/BaseComponents";

class CollectLoanMain extends React.Component {
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
            <Psegment>
                <Pheader header="Collect loans" />
                <Pgrid>
                    <Pgrid.Column width={6}>
                        <Message info>
                            <p>
                                When collecting a defaulted (not paid on time)
                                loan the ETH held in contract escrow
                                (collateral) will be transfered to system
                                reserves.{" "}
                            </p>
                            <p>
                                TODO, Not yet implemented: <br />
                                If the value of the ETH collateral (at the
                                moment of collection) is higher than the UCD
                                loan amount less the fees for the collection
                                then the leftover ETH will be transfered back to
                                the borrower's ETH account.
                            </p>
                        </Message>
                    </Pgrid.Column>
                    <Pgrid.Column width={10}>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Failed to collect all loans."
                                onDismiss={() => clearSubmitErrors()}
                            >
                                <p>
                                    One or more loan collection has failed.
                                </p>{" "}
                            </EthSubmissionErrorPanel>
                        )}

                        {!submitSucceeded &&
                        !isLoading &&
                        loansToCollect != null && (
                            <Form onSubmit={handleSubmit(this.handleSubmit)}>
                                <Button
                                    size="large"
                                    primary
                                    disabled={submitting}
                                >
                                    {submitting ? (
                                        "Submitting..."
                                    ) : (
                                        "Collect all"
                                    )}
                                </Button>
                            </Form>
                        )}

                        {submitSucceeded && (
                            <EthSubmissionSuccessPanel
                                header={
                                    <h3>
                                        Successful collection of{" "}
                                        {this.state.result.loansCollected} loans
                                    </h3>
                                }
                                eth={this.state.result.eth}
                            />
                        )}

                        {(isLoading || loansToCollect == null) && (
                            <LoadingPanel>
                                Refreshing list of loans to collect...
                            </LoadingPanel>
                        )}
                        <LoanList
                            header="Loans to collect"
                            noItemMessage={
                                <p>No defaulted and uncollected loan.</p>
                            }
                            loans={loansToCollect}
                        />
                    </Pgrid.Column>
                </Pgrid>
            </Psegment>
        );
    }
}

const mapStateToProps = state => ({
    loansToCollect: state.loanManager.loansToCollect,
    loanManager: state.loanManager.contract,
    isLoading: state.loanManager.isLoading
});

CollectLoanMain = connect(mapStateToProps)(CollectLoanMain);

export default reduxForm({
    form: "CollectLoanForm" // a unique identifier for this form
})(CollectLoanMain);
