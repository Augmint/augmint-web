/*
TODO: form client side validation. eg:
    - UCD balance check
    - address format check
    - number  format check
    - To: can't be the same as From:
TODO: input formatting: decimals, thousand separators
TODO: make this a pure component
  */

import React from "react";
import { Button, Label } from "semantic-ui-react";
import { connect } from "react-redux";
import store from "modules/store";
import {
    EthSubmissionErrorPanel,
    EthSubmissionSuccessPanel,
    ConnectionStatus
} from "components/MsgPanels";
import { reduxForm, SubmissionError, Field } from "redux-form";
import {
    Form,
    Validations,
    Normalizations,
    Parsers
} from "components/BaseComponents";
import {
    transferUcd,
    TOKENUCD_TRANSFER_SUCCESS
} from "modules/reducers/tokenUcd";
import { Pblock } from "components/PageLayout";
import { BigNumber } from "bignumber.js";

class UcdTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null };
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    validate(values) {
        console.debug("validate", this.props);
    }

    async handleSubmit(values) {
        // let error = {};
        // if (values.ucdAmount.gt(this.props.ucdBalance)) {
        //     error.ucdAmount = "Your UCD balance is less than the amount";
        // }
        //
        // if (
        //     values.payee.toLowerCase() === this.props.userAccount.toLowerCase()
        // ) {
        //     error.payee = "You can't transfer to yourself";
        // }
        //
        // if (error) {
        //     throw new SubmissionError(error);
        // }

        let res = await store.dispatch(
            transferUcd({
                payee: values.payee,
                ucdAmount: new BigNumber(values.ucdAmount),
                narrative: values.narrative
            })
        );
        if (res.type !== TOKENUCD_TRANSFER_SUCCESS) {
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
        const {
            error,
            handleSubmit,
            pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset,
            tokenUcd
        } = this.props;

        return (
            <Pblock
                loading={
                    tokenUcd.isLoading ||
                    (!tokenUcd.isConnected && !tokenUcd.connectionError)
                }
                header="Send UCD"
            >
                <ConnectionStatus contract={tokenUcd} />
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header={<h3>Successful transfer</h3>}
                        eth={this.state.result.eth}
                        onDismiss={() => reset()}
                    >
                        <p>
                            Sent {this.state.result.amount} UCD to{" "}
                            {this.state.result.to}
                        </p>
                    </EthSubmissionSuccessPanel>
                )}
                {!submitSucceeded && (
                    <Form
                        error={error ? true : false}
                        onSubmit={handleSubmit(this.handleSubmit)}
                    >
                        <EthSubmissionErrorPanel
                            error={error}
                            header={<h3>Transfer failed</h3>}
                            onDismiss={() => {
                                clearSubmitErrors();
                            }}
                        />

                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            name="ucdAmount"
                            placeholder="Amount"
                            labelPosition="right"
                            validate={[
                                Validations.required,
                                Validations.ucdAmount,
                                Validations.ucdUserBalance
                            ]}
                            normalize={Normalizations.ucdAmount}
                            disabled={submitting || !tokenUcd.isConnected}
                        >
                            <input />
                            <Label>UCD</Label>
                        </Field>

                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            label="To:"
                            size="small"
                            name="payee"
                            type="text"
                            parse={Parsers.trim}
                            validate={[
                                Validations.required,
                                Validations.address,
                                Validations.notOwnAddress
                            ]}
                            placeholder="0x0..."
                            disabled={submitting || !tokenUcd.isConnected}
                        />

                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            label="Reference:"
                            name="narrative"
                            type="text"
                            placeholder="short narrative (optional)"
                            disabled={submitting || !tokenUcd.isConnected}
                        />
                        <Button
                            loading={submitting}
                            primary
                            disabled={pristine}
                        >
                            {submitting ? "Submitting..." : "Transfer"}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

const mapStateToProps = state => ({
    tokenUcd: state.tokenUcd,
    ucdBalance: state.userBalances.account.ucdBalance,
    userAccount: state.web3Connect.userAccount,
    web3: state.web3Connect.web3Instance
});

UcdTransferForm = connect(mapStateToProps)(UcdTransferForm);

export default reduxForm({
    form: "UcdTransferForm"
})(UcdTransferForm);
