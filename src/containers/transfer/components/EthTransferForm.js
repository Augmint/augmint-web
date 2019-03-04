/*
????
TODO: form client side validation. eg:
    - address checksum and format check
TODO: input formatting: decimals, thousand separators
*/

import React from "react";
import { connect } from "react-redux";
import { reduxForm, SubmissionError, Field } from "redux-form";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import Button from "components/augmint-ui/button";
import { Form, Validations, Normalizations } from "components/BaseComponents";
// import { getTransferFee } from "modules/ethereum/transferTransactions";
import { transferToken, TOKEN_TRANSFER_SUCCESS } from "modules/reducers/augmintToken";
import theme from "styles/theme";

class EthTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null
            // feeAmount: "0",
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        this.setFeeByEthAmount = this.setFeeByEthAmount.bind(this);
    }

    // onEthAmountChange(e) {
    //     let amount;
    //     try {
    //         amount = parseFloat(e.target.value);
    //     } catch (error) {
    //         return;
    //     }
    //     this.setFeeByEthAmount(amount);
    // }

    // setFeeByEthAmount(amount) {
    //     const fee = getTransferFee(amount);
    //     this.setState({ feeAmount: fee });
    // }

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
            submitText,
            recipientEth
        } = this.props;

        return (
            <div style={isFunctional && { display: "inline" }}>
                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Token transfer submitted"
                        result={this.state.result}
                        onDismiss={() => reset()}
                    >
                        <p>
                            Transfer {this.state.tokenAmount} ETH to {this.state.to}
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
                                header="Transfer failed"
                                onDismiss={() => {
                                    clearSubmitErrors();
                                }}
                            />
                        )}

                        {!isFunctional && (
                            <div>
                                <p style={{ display: "block", marginBottom: 10 }}>
                                    Send a small amount enough for a few transactions:
                                </p>
                                <Field
                                    component={Form.Field}
                                    as={Form.Input}
                                    type={isFunctional ? "hidden" : "number"}
                                    name="ethAmount"
                                    placeholder="0.01"
                                    inputmode="numeric"
                                    step="any"
                                    min="0"
                                    onChange={this.onEthAmountChange}
                                    validate={[
                                        Validations.required,
                                        Validations.tokenAmount,
                                        Validations.userTokenBalanceWithTransferFee
                                    ]}
                                    normalize={Normalizations.twoDecimals}
                                    disabled={submitting || !augmintToken.isLoaded}
                                    data-testid="ethTransferAmountInput"
                                    style={{ borderRadius: theme.borderRadius.left }}
                                    labelAlignRight="ETH"
                                />
                                <p style={{ display: "block", marginBottom: 10 }}>
                                    Approx. €0.9 (covers 2 to 5 transactions)
                                </p>
                                {(augmintToken.info.feeMax !== 0 ||
                                    augmintToken.info.feeMin !== 0 ||
                                    augmintToken.info.feePt !== 0) && (
                                    <p style={{ display: "block", marginBottom: 10 }}>
                                        Fee: <span data-testid="ethTransferFeeAmount">{this.state.feeAmount}</span> A€{" "}
                                    </p>
                                )}
                            </div>
                        )}
                        <Button
                            type="submit"
                            loading={submitting}
                            disabled={!isFunctional && pristine}
                            data-testid="submitEthTransferButton"
                            className={submitting ? "loading" : ""}
                        >
                            {submitting ? "Submitting..." : submitText || "Transfer"}
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
    web3: state.web3Connect.web3Instance
});

EthTransferForm = connect(mapStateToProps)(EthTransferForm);

export default reduxForm({
    form: "EthTransferForm"
})(EthTransferForm);
