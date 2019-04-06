import React from "react";
import { connect } from "react-redux";
import { reduxForm, SubmissionError, Field } from "redux-form";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { transferEth, ETH_TRANSFER_SUCCESS } from "modules/reducers/ethTransfer";
import theme from "styles/theme";

class EthTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.placeholder = 0.01;
        this.state = {
            result: null,
            amount: this.placeholder
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
    }

    onEthAmountChange(e) {
        let amount;
        try {
            amount = parseFloat(e.target.value);
            if (isNaN(amount)) {
                amount = 0;
            } else {
                amount = parseFloat(e.target.value);
            }
        } catch (error) {
            return;
        }
        this.setState({ amount });
    }

    async handleSubmit(values) {
        const ethAmount = parseFloat(values.ethAmount);
        const res = await store.dispatch(
            transferEth({
                payee: this.props.payeeEthAddress,
                ethAmount
            })
        );
        if (res.type !== ETH_TRANSFER_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result,
                to: this.props.payeeEthAddress,
                ethAmount
            });
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
            augmintToken,
            isFunctional,
            submitText
        } = this.props;

        const amountInEur = (this.props.rates.info.ethFiatRate * this.state.amount).toFixed(2);

        return (
            <div style={isFunctional && { display: "inline" }}>
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="ETH transfer submitted"
                        result={this.state.result}
                        onDismiss={() => reset()}
                    >
                        <p>
                            Transfer {this.state.ethAmount} ETH to {this.state.to}
                        </p>
                    </EthSubmissionSuccessPanel>
                )}
                {!submitSucceeded && (
                    <Form
                        error={error ? "true" : "false"}
                        onSubmit={handleSubmit(this.handleSubmit)}
                        style={isFunctional && { display: "inline" }}
                    >
                        {error && (
                            <EthSubmissionErrorPanel
                                error={error}
                                header="ETH transfer failed"
                                onDismiss={() => {
                                    clearSubmitErrors();
                                }}
                            />
                        )}

                        {!isFunctional && (
                            <div>
                                <p style={{ display: "block", marginTop: 0, marginBottom: 10, marginLeft: 2 }}>
                                    Send a small amount enough for a few transactions:
                                </p>
                                <Field
                                    name="ethAmount"
                                    component={Form.Field}
                                    as={Form.Input}
                                    type="number"
                                    placeholder={this.placeholder}
                                    inputmode="numeric"
                                    step="any"
                                    min="0"
                                    onChange={this.onEthAmountChange}
                                    validate={[Validations.required, Validations.ethAmount, Validations.ethUserBalance]}
                                    normalize={Normalizations.fiveDecimals}
                                    disabled={submitting || !augmintToken.isLoaded}
                                    data-testid="ethTransferAmountInput"
                                    style={{ borderRadius: theme.borderRadius.left }}
                                    labelAlignRight="ETH"
                                />
                                <p style={{ display: "block", marginTop: 0, marginBottom: 20, marginLeft: 2 }}>
                                    Approx. €{amountInEur} (covers 2 to 5 transactions)
                                </p>
                            </div>
                        )}
                        <Button
                            type="submit"
                            loading={submitting}
                            disabled={!isFunctional && pristine}
                            data-testid="submitEthTransferButton"
                            className={submitting ? "loading" : ""}
                        >
                            {submitting ? "Submitting..." : submitText || "Send ETH"}
                        </Button>
                    </Form>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    augmintToken: state.augmintToken,
    tokenBalance: state.userBalances.account.tokenBalance,
    userAccount: state.web3Connect.userAccount,
    web3: state.web3Connect.web3Instance,
    rates: state.rates
});

EthTransferForm = connect(mapStateToProps)(EthTransferForm);

export default reduxForm({
    form: "EthTransferForm"
})(EthTransferForm);
