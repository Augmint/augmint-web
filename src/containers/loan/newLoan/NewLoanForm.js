/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import {
    FormGroup,
    InputGroup,
    ControlLabel,
    Button,
    HelpBlock
} from "react-bootstrap";
import { EthSubmissionErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import { FieldInput, Form } from "components/BaseComponents";
import BigNumber from "bignumber.js";

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
        let usdcValue = bn_loanUcdAmount
            .div(this.props.product.bn_loanCollateralRatio)
            .round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP);

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
        let usdcValue = val
            .div(this.props.product.bn_loanCollateralRatio)
            .round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP);

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
            clearSubmitErrors
        } = this.props;
        return (
            <Form onSubmit={handleSubmit}>
                {error &&
                    <EthSubmissionErrorPanel
                        error={error}
                        header={<h3>Create loan failed</h3>}
                        onDismiss={() => clearSubmitErrors()}
                    />}
                <fieldset disabled={submitting}>
                    <legend>Loan parameters</legend>

                    <FormGroup bsSize="large">
                        <ControlLabel>
                            Disbursed amount (to be payed out){" "}
                        </ControlLabel>
                        <InputGroup>
                            <Field
                                name="disbursedUcdAmount"
                                component={FieldInput}
                                type="number"
                                onChange={this.onDisbursedUcdAmountChange}
                            />
                            <InputGroup.Addon>UCD</InputGroup.Addon>
                        </InputGroup>
                        <HelpBlock>
                            Disbursed amount = Loan amount x Discount Rate{" "}
                        </HelpBlock>
                    </FormGroup>

                    <FormGroup bsSize="large">
                        <ControlLabel>
                            Loan amount (to be payed back)
                        </ControlLabel>
                        <InputGroup>
                            <Field
                                name="loanUcdAmount"
                                component={FieldInput}
                                type="number"
                                onChange={this.onLoanUcdAmountChange}
                            />
                            <InputGroup.Addon>UCD</InputGroup.Addon>
                        </InputGroup>
                        <HelpBlock>
                            Loan UCD amount = Disbursed amount x ( 1 / Discount
                            Rate )
                        </HelpBlock>
                    </FormGroup>

                    <FormGroup bsSize="large">
                        <ControlLabel>Collateral (goes to escrow)</ControlLabel>
                        <InputGroup>
                            <Field
                                name="ethAmount"
                                component={FieldInput}
                                type="number"
                                onChange={this.onEthAmountChange}
                            />
                            <InputGroup.Addon>ETH</InputGroup.Addon>
                        </InputGroup>
                        <HelpBlock>
                            ETH to be held as collateral = UCD Loan Amount /
                            ETHUSD rate x (1 / Coverage ratio)
                            <br />( ETH/USD Rate ={" "}
                            {Math.round(
                                this.props.rates.info.ethUsdRate * 100
                            ) / 100}{" "}
                            )
                        </HelpBlock>
                    </FormGroup>
                    <FormGroup>
                        <Button
                            type="submit"
                            bsSize="large"
                            bsStyle="primary"
                            disabled={pristine}
                        >
                            {submitting ? "Submitting..." : "Submit"}
                        </Button>
                    </FormGroup>
                </fieldset>
            </Form>
        );
    }
}

export default (NewLoanForm = reduxForm({
    form: "NewLoanForm"
})(NewLoanForm));
