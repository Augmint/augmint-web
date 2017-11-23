import React from "react";
import { connect } from "react-redux";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import { Button } from "semantic-ui-react";
import { SubmissionError, reduxForm } from "redux-form";
import {
    collectLoans,
    LOANMANAGER_COLLECT_SUCCESS
} from "modules/reducers/loanManager";
import {
    EthSubmissionErrorPanel,
    EthSubmissionSuccessPanel
} from "components/MsgPanels";
import { LoadingPanel } from "components/MsgPanels";
import { Form } from "components/BaseComponents";

class CollectLoanButton extends React.Component {
    async handleSubmit(values) {
        //values.preventDefault();
        let res = await store.dispatch(collectLoans(this.props.loansToCollect));

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
            if (this.props.onSuccess) {
                this.props.onSuccess();
            }
            return;
        }
    }

    constructor(props) {
        super(props);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        const {
            error,
            submitSucceeded,
            handleSubmit,
            clearSubmitErrors,
            isLoading,
            submitting,
            reset,
            loansToCollect
        } = this.props;
        return (
            <Pblock>
                {error && (
                    <EthSubmissionErrorPanel
                        error={error}
                        header="Failed to collect all loans."
                        onDismiss={() => clearSubmitErrors()}
                    >
                        <p>One or more loan collection has failed.</p>{" "}
                    </EthSubmissionErrorPanel>
                )}

                {!submitSucceeded &&
                    !isLoading &&
                    loansToCollect != null && (
                        <Form onSubmit={handleSubmit(this.handleSubmit)}>
                            <Button
                                size="large"
                                primary
                                disabled={
                                    submitting ||
                                    this.props.loansToCollect.length === 0
                                }
                            >
                                {submitting ? "Submitting..." : "Collect"}
                            </Button>
                        </Form>
                    )}

                {(isLoading || loansToCollect == null) && (
                    <LoadingPanel>
                        Refreshing list of loans to collect...
                    </LoadingPanel>
                )}

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header={
                            <h3>
                                Successful collection of{" "}
                                {this.state.result.loansCollected} loans
                            </h3>
                        }
                        onDismiss={() => reset()}
                        eth={this.state.result.eth}
                    />
                )}
            </Pblock>
        );
    }
}

const mapStateToProps = state => ({
    loanManager: state.loanManager.contract,
    isLoading: state.loanManager.isLoading
});

CollectLoanButton = connect(mapStateToProps)(CollectLoanButton);

export default reduxForm({
    form: "CollectLoanButton" // a unique identifier for this form
})(CollectLoanButton);
