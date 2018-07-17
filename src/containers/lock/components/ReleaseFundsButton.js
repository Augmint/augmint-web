/* TODO:
 -  make confirmation through flash notification (so we don't need to keep it open while tx processing)
 - confirmation modal closes if there is an order / ordefill / cancel event in the background. We need to  handle
        it's b/c we reload the whole order book on newOrder / orderfill events. It's planned to maintan orderbook
        state on client which will resolve this issue.
*/
import React from "react";
import store from "modules/store";
import Button from "components/augmint-ui/button";
import { MyGridTableColumn as Col } from "components/MyListGroups";
import { releaseFunds, LOCKTRANSACTIONS_RELEASE_FUNDS_SUCCESS } from "modules/reducers/lockTransactions";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";

export default class ReleaseLockButton extends React.Component {
    async submitCancel(values) {
        //values.preventDefault();
        this.setState({ submitting: true, error: null });

        const res = await store.dispatch(releaseFunds(this.props.lockId));

        if (res.type !== LOCKTRANSACTIONS_RELEASE_FUNDS_SUCCESS) {
            this.setState({
                submitting: false,
                error: res.error
            });
        } else {
            this.setState({
                submitting: false,
                submitSucceeded: true,
                error: null,
                result: res.result
            });
            return;
        }
    }

    constructor(props) {
        super(props);
        this.state = {
            submitSucceeded: false,
            submitting: false,
            error: null,
            result: null
        };
        this.submitCancel = this.submitCancel.bind(this);
    }

    render() {
        const { submitting, submitSucceeded, error } = this.state;

        return (
            <Col>
                {error && (
                    <EthSubmissionErrorPanel
                        onDismiss={() => {
                            this.setState({ error: null });
                        }}
                        error={error}
                        header="Funds release failed"
                    />
                )}

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Funds release transaction submitted"
                        result={this.state.result}
                        onDismiss={() => this.setState({ submitSucceeded: false })}
                        data-test-orderid={this.state.result.orderId}
                    />
                )}

                {!error &&
                    !submitSucceeded && (
                        <Button data-testid={`releaseLockButton`} disabled={submitting} onClick={this.submitCancel}>
                            {submitting ? "Submitting..." : "Release funds"}
                        </Button>
                    )}
            </Col>
        );
    }
}
