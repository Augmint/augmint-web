/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Button, Label } from "semantic-ui-react";
import { EthSubmissionErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import { Form } from "components/BaseComponents";
import BigNumber from "bignumber.js";
import { Pblock } from "components/PageLayout";
import ToolTip from "components/ToolTip";

const ETH_DECIMALS = 5;
const UCD_DECIMALS = 2;

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.onDisbursedUcdAmountChange = this.onDisbursedUcdAmountChange.bind(
            this
        );
        this.onLoanUcdAmountChange = this.onLoanUcdAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
    }

    onDisbursedUcdAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("loanUcdAmount", "");
            this.props.change("ethAmount", "");
            return;
        }
        let bn_loanUcdAmount = val
            .div(this.props.product.bn_discountRate)
            .round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP);
        let usdcValue = bn_loanUcdAmount.div(
            this.props.product.bn_loanCollateralRatio
        );

        let bn_ethAmount = usdcValue.div(this.props.rates.info.bn_ethUsdRate);

        this.props.change(
            "loanUcdAmount",
            bn_loanUcdAmount.round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP)
        );
        this.props.change(
            "ethAmount",
            bn_ethAmount.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP) //.toFixed(18)
        );
    }

    onLoanUcdAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("disbursedUcdAmount", "");
            this.props.change("ethAmount", "");
            return;
        }
        let usdcValue = val.div(this.props.product.bn_loanCollateralRatio);

        let bn_disbursedUcdAmount = val
            .times(this.props.product.bn_discountRate)
            .round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP);
        let bn_ethAmount = usdcValue.div(this.props.rates.info.bn_ethUsdRate);
        this.props.change(
            "disbursedUcdAmount",
            bn_disbursedUcdAmount.round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP)
        );
        this.props.change(
            "ethAmount",
            bn_ethAmount.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP) //.toFixed(18)
        );
    }

    onEthAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("disbursedUcdAmount", "");
            this.props.change("loanUcdAmount", "");
            return;
        }
        let usdcValue = val.times(this.props.rates.info.bn_ethUsdRate);

        let bn_loanUcdAmount = this.props.product.bn_loanCollateralRatio.times(
            usdcValue
        );
        let bn_disbursedUcdAmount = bn_loanUcdAmount.times(
            this.props.product.bn_discountRate
        );
        this.props.change(
            "disbursedUcdAmount",
            bn_disbursedUcdAmount.round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP)
        );
        this.props.change(
            "loanUcdAmount",
            bn_loanUcdAmount.round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP)
        );
    }

    render() {
        const {
            error,
            handleSubmit,
            pristine,
            submitting,
            clearSubmitErrors,
            loanManager
        } = this.props;
        return (
            <Pblock header="Loan parameters">
                {error && (
                    <EthSubmissionErrorPanel
                        error={error}
                        header={<h3>Create loan failed</h3>}
                        onDismiss={() => clearSubmitErrors()}
                    />
                )}
                <Form onSubmit={handleSubmit}>
                    <Field
                        component={Form.Field}
                        as={Form.Input}
                        name="disbursedUcdAmount"
                        type="number"
                        disabled={submitting || !loanManager.isConnected}
                        onChange={this.onDisbursedUcdAmountChange}
                        labelPosition="right"
                        placeholder="pay out"
                    >
                        <Label basic>
                            Disbursed amount{": "}
                            <ToolTip>
                                Disbursed (payed out) amount = Loan amount x
                                Discount Rate{" "}
                            </ToolTip>
                        </Label>

                        <input />
                        <Label>UCD</Label>
                    </Field>

                    <Field
                        component={Form.Field}
                        as={Form.Input}
                        name="loanUcdAmount"
                        placeholder="to pay back"
                        type="number"
                        disabled={submitting || !loanManager.isConnected}
                        onChange={this.onLoanUcdAmountChange}
                        labelPosition="right"
                    >
                        <Label basic>
                            Loan amount{": "}
                            <ToolTip>
                                Loan UCD amount to be payed back = Disbursed
                                amount x ( 1 / Discount Rate )
                            </ToolTip>
                        </Label>
                        <input />
                        <Label>UCD</Label>
                    </Field>

                    <Field
                        component={Form.Field}
                        as={Form.Input}
                        name="ethAmount"
                        type="number"
                        placeholder="amount taken to escrow"
                        disabled={submitting || !loanManager.isConnected}
                        onChange={this.onEthAmountChange}
                        labelPosition="right"
                    >
                        <Label basic>
                            Collateral:{" "}
                            <ToolTip>
                                ETH to be held as collateral = UCD Loan Amount /
                                ETHUSD rate x (1 / Coverage ratio)
                                <br />( ETH/USD Rate ={" "}
                                {Math.round(
                                    this.props.rates.info.ethUsdRate * 100
                                ) / 100}{" "}
                                )
                            </ToolTip>
                        </Label>
                        <input />
                        <Label>ETH</Label>
                    </Field>

                    <Button
                        primary
                        size="big"
                        loading={submitting}
                        disabled={pristine}
                    >
                        {submitting ? "Submitting..." : "Get loan"}
                    </Button>
                </Form>
            </Pblock>
        );
    }
}

export default (NewLoanForm = reduxForm({
    form: "NewLoanForm"
})(NewLoanForm));
