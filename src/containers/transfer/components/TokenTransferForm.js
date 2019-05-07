/*
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
import { Form, Validations, Normalizations, Parsers } from "components/BaseComponents";
import { getTransferFee } from "modules/ethereum/transferTransactions";
import { transferToken, TOKEN_TRANSFER_SUCCESS } from "modules/reducers/augmintToken";
import { getPayeesEthBalance } from "modules/payeeEthBalance";
import { TransferFeeToolTip } from "./AccountToolTips";
import theme from "styles/theme";

class TokenTransferForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null,
            feeAmount: "0",
            urlResolved: false
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
        this.setFeeByAmount = this.setFeeByAmount.bind(this);
        this.toggleEthTransferForm = this.toggleEthTransferForm.bind(this);
    }

    componentDidUpdate() {
        if (!this.state.urlResolved && this.props.augmintToken.isLoaded) {
            const { blur } = this.props;
            const urlParams = new URL(document.location).searchParams;
            const addressFromParam = urlParams.get("address");
            const amountFromParam = urlParams.get("amount");
            const referenceFromParam = urlParams.get("reference");

            if (amountFromParam !== null) {
                blur("tokenAmount", amountFromParam);
                this.setFeeByAmount(amountFromParam);
            }

            if (addressFromParam !== null) {
                blur("payee", addressFromParam);
            }

            if (referenceFromParam !== null) {
                blur("narrative", referenceFromParam);
            }

            this.setState({ urlResolved: true });
        }
    }

    onTokenAmountChange(e) {
        let amount;
        try {
            amount = parseFloat(e.target.value);
        } catch (error) {
            return;
        }
        this.setFeeByAmount(amount);
    }

    setFeeByAmount(amount) {
        const fee = getTransferFee(amount);
        this.setState({ feeAmount: fee });
    }

    toggleEthTransferForm(e, payeeEthAddress) {
        this.props.toggleEthTransferForm(e, payeeEthAddress);
    }

    async handleSubmit(values) {
        const tokenAmount = parseFloat(values.tokenAmount);
        const payeeEthBalance = await getPayeesEthBalance(values.payee);

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
            if (!payeeEthBalance.error && payeeEthBalance.ethBalance === "0") {
                this.toggleEthTransferForm(true, values.payee);
            }

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
            submitText
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
                            Transfer {this.state.tokenAmount} A-EUR to {this.state.to}
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
                                <Field
                                    component={Form.Field}
                                    as={Form.Input}
                                    type={isFunctional ? "hidden" : "number"}
                                    inputmode="numeric"
                                    step="any"
                                    min="0"
                                    label="Amount to transfer ..."
                                    name="tokenAmount"
                                    ref={e => {
                                        this.input = e;
                                    }}
                                    onChange={this.onTokenAmountChange}
                                    validate={[
                                        Validations.required,
                                        Validations.tokenAmount,
                                        Validations.userTokenBalanceWithTransferFee
                                    ]}
                                    normalize={Normalizations.twoDecimals}
                                    disabled={submitting || !augmintToken.isLoaded}
                                    data-testid="transferAmountInput"
                                    style={{ borderRadius: theme.borderRadius.left, marginBottom: "0" }}
                                    labelAlignRight="A-EUR"
                                    autoFocus={true}
                                />
                                {(augmintToken.info.feeMax !== 0 ||
                                    augmintToken.info.feeMin !== 0 ||
                                    augmintToken.info.feePt !== 0) && (
                                    <small
                                        style={{
                                            display: "block",
                                            marginBottom: "1rem",
                                            marginTop: "-22px",
                                            color: "#999",
                                            fontSize: "12px"
                                        }}
                                    >
                                        Fee: <span data-testid="transferFeeAmount">{this.state.feeAmount}</span> A€{" "}
                                        <TransferFeeToolTip augmintTokenInfo={augmintToken.info} />
                                    </small>
                                )}

                                <Field
                                    component={Form.Field}
                                    className="nolabel small-text"
                                    as={Form.Input}
                                    label="To ..."
                                    size="small"
                                    data-testid="transferToAddressField"
                                    name="payee"
                                    type={isFunctional ? "hidden" : "text"}
                                    parse={Parsers.trim}
                                    validate={[Validations.required, Validations.address, Validations.notOwnAddress]}
                                    placeholder="0x0..."
                                    disabled={submitting || !augmintToken.isLoaded}
                                />

                                <div style={{ marginTop: "1rem" }}>
                                    <Field
                                        component={Form.Field}
                                        as={Form.Input}
                                        className="nolabel"
                                        data-testid="transferNarrativeField"
                                        label="Add narrative (optional) ..."
                                        name="narrative"
                                        type={isFunctional ? "hidden" : "text"}
                                        disabled={submitting || !augmintToken.isLoaded}
                                    />
                                </div>
                            </div>
                        )}
                        <Button
                            type="submit"
                            style={{ width: "100%", height: 50, marginTop: "1rem" }}
                            loading={submitting}
                            disabled={!isFunctional && pristine}
                            data-testid="submitTransferButton"
                            className={submitting ? "loading" : ""}
                        >
                            {submitting ? "Submitting..." : submitText || "Send"}
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

TokenTransferForm = connect(mapStateToProps)(TokenTransferForm);

export default reduxForm({
    form: "TokenTransferForm",
    touchOnBlur: false
})(TokenTransferForm);
