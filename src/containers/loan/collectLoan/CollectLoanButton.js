import React from "react";
import store from "modules/store";
import { Pblock } from "components/PageLayout";
import Button from "components/augmint-ui/button";
import { SubmissionError, reduxForm } from "redux-form";
import { collectLoans, LOANTRANSACTIONS_COLLECT_SUCCESS } from "modules/reducers/loanTransactions";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { LoadingPanel } from "components/MsgPanels";
import { Form } from "components/BaseComponents";

import "./CollectLoanButton.css";

class CollectLoanButton extends React.Component {
    async handleSubmit() {
        const res = await store.dispatch(collectLoans(this.props.loansToCollect));

        if (res.type !== LOANTRANSACTIONS_COLLECT_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
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
            submitting,
            reset,
            loanManager,
            loansToCollect,
            idName
        } = this.props;
        const { isLoading } = loanManager;
        return (
            <Pblock id={idName}>
                {error && (
                    <EthSubmissionErrorPanel
                        error={error}
                        header="Failed to collect all loans."
                        onDismiss={() => clearSubmitErrors()}
                    >
                        <p>One or more loan collection has failed.</p>
                    </EthSubmissionErrorPanel>
                )}

                {!submitSucceeded && !isLoading && loansToCollect != null && (
                    <Form onSubmit={handleSubmit(this.handleSubmit)}>
                        <Button
                            size="large"
                            data-testid="collectLoanButton"
                            disabled={submitting || isLoading || loansToCollect.length === 0}
                            type="submit"
                        >
                            {submitting ? "Submitting..." : "Collect"}
                        </Button>
                    </Form>
                )}

                {isLoading && <LoadingPanel>Refreshing list of loans to collect...</LoadingPanel>}

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Collect loan(s) submitted"
                        onDismiss={() => reset()}
                        result={this.state.result}
                    />
                )}
            </Pblock>
        );
    }
}

export default reduxForm({
    form: "CollectLoanButton" // a unique identifier for this form
})(CollectLoanButton);
