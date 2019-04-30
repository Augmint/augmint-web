import React from "react";
import { connect } from "react-redux";
import { reduxForm, SubmissionError, Field } from "redux-form";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { transferEth, ETH_TRANSFER_SUCCESS } from "modules/reducers/ethTransfer";
import { ETH } from "components/augmint-ui/currencies";
import theme from "styles/theme";

class EthTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.initialVal = this.props.initialValues.ethAmount;
        this.state = {
            result: null,
            amount: this.initialVal
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        this.toggleEthTransferForm = this.toggleEthTransferForm.bind(this);
    }

    toggleEthTransferForm(e) {
        this.props.toggleEthTransferForm(e);
    }

    onEthAmountChange(e) {
        let amount = parseFloat(e.target.value);
        this.setState({ amount });
    }

    async handleSubmit(values) {
        const ethAmount = parseFloat(values.ethAmount);
        const res = await store.dispatch(
            transferEth({
                payee: this.props.address,
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
                to: this.props.address,
                ethAmount
            });
        }
    }

    render() {
        const {
            error,
            handleSubmit,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            augmintToken,
            isFunctional,
            submitText
        } = this.props;

        const amountInEur = (this.props.rates.info.ethFiatRate * this.state.amount).toFixed(2);
        const coverdTxs = Math.round((this.state.amount / this.initialVal) * 5);

        return (
            <div style={isFunctional && { display: "inline" }}>
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="ETH transfer submitted"
                        result={this.state.result}
                        onDismiss={() => this.toggleEthTransferForm(false)}
                    >
                        <p>
                            Transfer <ETH amount={this.state.ethAmount} /> to {this.state.to}
                        </p>
                    </EthSubmissionSuccessPanel>
                )}
                {!submitSucceeded && (
                    <Form
                        error={error}
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
                                    The recipient needs ETH to spend <br />
                                    A-EUR, but does not have any.
                                    <br />
                                    Send a small amount enough
                                    <br />
                                    for a few transactions:
                                </p>
                                <Field
                                    name="ethAmount"
                                    component={Form.Field}
                                    as={Form.Input}
                                    type="number"
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
                                {!isNaN(this.state.amount) && (
                                    <p style={{ display: "block", marginTop: 0, marginBottom: 20, marginLeft: 2 }}>
                                        ≈€{amountInEur} (covers ≈{coverdTxs} transactions)
                                    </p>
                                )}
                            </div>
                        )}
                        <Button
                            type="submit"
                            loading={submitting}
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
    form: "EthTransferForm",
    initialValues: { ethAmount: 0.01 }
})(EthTransferForm);
