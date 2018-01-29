/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Button, Label } from "semantic-ui-react";
import { EthSubmissionErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import BigNumber from "bignumber.js";
import { Pblock } from "components/PageLayout";
import ToolTip from "components/ToolTip";

const ETH_DECIMALS = 5;
const TOKEN_DECIMALS = 2;

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.onDisbursedTokenAmountChange = this.onDisbursedTokenAmountChange.bind(this);
        this.onRepaymentAmountAmountChange = this.onRepaymentAmountAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        // this a a workaround for validations with parameters causing issues,
        //    see https://github.com/erikras/redux-form/issues/2453#issuecomment-272483784
        this.minToken = Validations.minTokenAmount(this.props.product.minDisbursedAmountInToken);
    }

    onDisbursedTokenAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("repaymentAmount", "");
            this.props.change("ethAmount", "");
            return;
        }
        const bn_repaymentAmountAmount = val
            .div(this.props.product.bn_discountRate)
            .round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP);
        const fiatcValue = bn_repaymentAmountAmount.div(this.props.product.bn_loanCollateralRatio);

        const bn_ethAmount = fiatcValue.div(this.props.rates.info.bn_ethFiatRate);

        this.props.change(
            "repaymentAmount",
            bn_repaymentAmountAmount.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP).toString()
        );
        this.props.change(
            "ethAmount",
            bn_ethAmount.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP).toString() //.toFixed(18)
        );
    }

    onRepaymentAmountAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("disbursedTokenAmount", "");
            this.props.change("ethAmount", "");
            return;
        }
        const fiatcValue = val.div(this.props.product.bn_loanCollateralRatio);

        const bn_disbursedTokenAmount = val
            .times(this.props.product.bn_discountRate)
            .round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP);
        const bn_ethAmount = fiatcValue.div(this.props.rates.info.bn_ethFiatRate);
        this.props.change(
            "disbursedTokenAmount",
            bn_disbursedTokenAmount.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP).toString()
        );
        this.props.change(
            "ethAmount",
            bn_ethAmount.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP).toString() //.toFixed(18)
        );
    }

    onEthAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("disbursedTokenAmount", "");
            this.props.change("repaymentAmount", "");
            return;
        }
        const fiatcValue = val.times(this.props.rates.info.bn_ethFiatRate);

        const bn_repaymentAmountAmount = this.props.product.bn_loanCollateralRatio.times(fiatcValue);
        const bn_disbursedTokenAmount = bn_repaymentAmountAmount.times(this.props.product.bn_discountRate);
        this.props.change(
            "disbursedTokenAmount",
            bn_disbursedTokenAmount.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP).toString()
        );
        this.props.change(
            "repaymentAmount",
            bn_repaymentAmountAmount.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP).toString()
        );
    }

    render() {
        const { error, handleSubmit, pristine, submitting, clearSubmitErrors, loanManager, onSubmit } = this.props;
        return (
            <Pblock header="Loan parameters">
                {error && (
                    <EthSubmissionErrorPanel
                        error={error}
                        header={<h3>Create loan failed</h3>}
                        onDismiss={() => clearSubmitErrors()}
                    />
                )}
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Field
                        component={Form.Field}
                        as={Form.Input}
                        name="disbursedTokenAmount"
                        id="disbursedTokenAmount"
                        type="number"
                        disabled={submitting || !loanManager.isConnected}
                        validate={[Validations.required, Validations.tokenAmount, this.minToken]}
                        normalize={Normalizations.twoDecimals}
                        onChange={this.onDisbursedTokenAmountChange}
                        labelPosition="right"
                        placeholder="pay out"
                    >
                        <Label basic>
                            Loan amount{": "}
                            <ToolTip>
                                Disbursed loan amount (payed out) = Repayable loan amount x Discount Rate{" "}
                            </ToolTip>
                        </Label>

                        <input />
                        <Label>A&#8209;EUR</Label>
                    </Field>
                    <Field
                        component={Form.Field}
                        as={Form.Input}
                        name="repaymentAmount"
                        id="repaymentAmount"
                        placeholder="to pay back"
                        type="number"
                        disabled={submitting || !loanManager.isConnected}
                        validate={[Validations.required, Validations.tokenAmount]}
                        normalize={Normalizations.twoDecimals}
                        onChange={this.onRepaymentAmountAmountChange}
                        labelPosition="right"
                    >
                        <Label basic>
                            Repayment amount{": "}
                            <ToolTip>
                                Loan A&#8209;EUR amount to be payed back = Disbursed amount x ( 1 / Discount Rate )
                            </ToolTip>
                        </Label>
                        <input />
                        <Label>A&#8209;EUR</Label>
                    </Field>
                    <Field
                        component={Form.Field}
                        as={Form.Input}
                        name="ethAmount"
                        id="ethAmount"
                        type="number"
                        placeholder="amount taken to escrow"
                        disabled={submitting || !loanManager.isConnected}
                        validate={[Validations.required, Validations.ethAmount, Validations.ethUserBalance]}
                        normalize={Normalizations.fiveDecimals}
                        onChange={this.onEthAmountChange}
                        labelPosition="right"
                    >
                        <Label basic>
                            Collateral:{" "}
                            <ToolTip>
                                ETH to be held as collateral = A&#8209;EUR Loan Amount / ETHEUR rate x (1 / Coverage ratio)
                                <br />( ETH/EUR Rate = {Math.round(this.props.rates.info.ethFiatRate * 100) / 100} )
                            </ToolTip>
                        </Label>
                        <input />
                        <Label>ETH</Label>
                    </Field>
                    <Button primary size="big" id="submitBtn" loading={submitting} disabled={pristine}>
                        {submitting ? "Submitting..." : "Get loan"}
                    </Button>
                </Form>
            </Pblock>
        );
    }
}
NewLoanForm = reduxForm({
    form: "NewLoanForm"
})(NewLoanForm);

export default NewLoanForm;
