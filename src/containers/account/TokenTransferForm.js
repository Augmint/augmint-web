/*
TODO: form client side validation. eg:
    - address checksum and format check
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import Button from "components/augmint-ui/button";
import { StyleLabel } from "components/augmint-ui/FormCustomLabel/styles";
import { connect } from "react-redux";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel, ConnectionStatus } from "components/MsgPanels";
import { reduxForm, SubmissionError, Field } from "redux-form";
import { Form, Validations, Normalizations, Parsers } from "components/BaseComponents";
import { getTransferFee } from "modules/ethereum/transferTransactions";
import { transferToken, TOKEN_TRANSFER_SUCCESS } from "modules/reducers/augmintToken";
import { Pblock } from "components/PageLayout";
import { TransferFeeToolTip } from "./components/AccountToolTips.js";

class TokenTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null, feeAmount: "0" };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
    }

    onTokenAmountChange(e) {
        let amount;
        try {
            amount = parseFloat(e.target.value);
        } catch (error) {
            return;
        }
        const fee = getTransferFee(amount);
        this.setState({ feeAmount: fee });
    }

    async handleSubmit(values) {
        const tokenAmount = parseFloat(values.tokenAmount);
        const res = await store.dispatch(
            transferToken({
                payee: values.payee,
                tokenAmount,
                narrative: values.narrative
            })
        );
        if (res.type !== TOKEN_TRANSFER_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result,
                to: values.payee,
                tokenAmount,
                feeAmount: "0"
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
            augmintToken
        } = this.props;

        return (
            <Pblock
                loading={augmintToken.isLoading || (!augmintToken.isLoaded && !augmintToken.loadError)}
                header="Send A-EUR"
            >
                <ConnectionStatus contract={augmintToken} />
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Token transfer submitted"
                        result={this.state.result}
                        onDismiss={() => reset()}
                    >
                        <p>
                            Transfer {this.state.tokenAmount} A-EUR to {this.state.to}
                        </p>
                    </EthSubmissionSuccessPanel>
                )}
                {!submitSucceeded && (
                    <Form error={error ? true : false} onSubmit={handleSubmit(this.handleSubmit)}>
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="Transfer failed"
                                onDismiss={() => {
                                    clearSubmitErrors();
                                }}
                            />
                        )}

                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            name="tokenAmount"
                            placeholder="Amount"
                            labelposition="right"
                            onChange={this.onTokenAmountChange}
                            validate={[
                                Validations.required,
                                Validations.tokenAmount,
                                Validations.userTokenBalanceWithTransferFee
                            ]}
                            normalize={Normalizations.twoDecimals}
                            disabled={submitting || !augmintToken.isLoaded}
                        >
                            <input data-testid="transferAmountInput" />
                            <StyleLabel align="right">A-EUR</StyleLabel>
                        </Field>

                        <small>
                            Fee: <TransferFeeToolTip augmintTokenInfo={augmintToken.info} />
                            <span data-testid="transferFeeAmount">{this.state.feeAmount}</span> A€
                        </small>

                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            label="To:"
                            size="small"
                            data-testid="transferToAddressField"
                            name="payee"
                            type="text"
                            parse={Parsers.trim}
                            validate={[Validations.required, Validations.address, Validations.notOwnAddress]}
                            placeholder="0x0..."
                            disabled={submitting || !augmintToken.isLoaded}
                        />

                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            data-testid="transferNarrativeField"
                            label="Reference:"
                            name="narrative"
                            type="text"
                            placeholder="short narrative (optional)"
                            disabled={submitting || !augmintToken.isLoaded}
                        />
                        <Button
                            type="submit"
                            loading={submitting}
                            disabled={pristine}
                            data-testid="submitTransferButton"
                            className={submitting ? "loading" : ""}
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
    augmintToken: state.augmintToken,
    tokenBalance: state.userBalances.account.tokenBalance,
    userAccount: state.web3Connect.userAccount,
    web3: state.web3Connect.web3Instance
});

TokenTransferForm = connect(mapStateToProps)(TokenTransferForm);

export default reduxForm({
    form: "TokenTransferForm"
})(TokenTransferForm);
