/*
TODO: move this to containers b/c it's not stateless
TODO: form validation. eg: http://redux-form.com or more: https://react.rocks/tag/Validation
FIXME:  clear success and error states after submit
FIXME: Rounding issues. Eg. 20UCD entered to disbursed is not enough for minDisbursedAmountInUcd
                            100 UCD requested to disbursed is 99.9999 actual
        - handle different values calculated here & in contract at tx.
        - rates precision is too high?
        - Introduce BigNumbers + figure out rounding (here and rates too)  */

import React from "react";
import {
    FormGroup,
    InputGroup,
    ControlLabel,
    Button,
    HelpBlock
} from "react-bootstrap";
import { EthSubmissionErrorPanel } from "components/MsgPanels";
import { Form, Field, reduxForm } from "redux-form";
import { FieldInput } from "components/FieldInput";
import BigNumber from "bignumber.js";

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.onDisbursedUcdAmountChange = this.onDisbursedUcdAmountChange.bind(
            this
        );
        this.onLoanUcdAmountChange = this.onLoanUcdAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_HALF_UP });
    }

    onDisbursedUcdAmountChange(e) {
        try {
            let BN_1 = new BigNumber(1);
            let bn_loanUcdAmount = BN_1.div(
                this.props.product.bn_discountRate
            ).times(e.target.value);
            let bn_ethAmount = bn_loanUcdAmount
                .div(this.props.product.bn_loanCollateralRatio)
                .times(BN_1.div(this.props.rates.info.ethUsdRate));

            this.props.change("loanUcdAmount", bn_loanUcdAmount.round(4));
            this.props.change("ethAmount", bn_ethAmount.round(18));
        } catch (error) {
            this.props.change("loanUcdAmount", "");
            this.props.change("ethAmount", "");
        }
    }

    onLoanUcdAmountChange(e) {
        try {
            let bn_disbursedUcdAmount = this.props.product.bn_discountRate
                .mul(e.target.value)
                .round(4);
            let bn_ethAmount = new BigNumber(e.target.value)
                .div(this.props.product.bn_loanCollateralRatio)
                .times(this.props.rates.info.bn_usdEthRate);
            this.props.change(
                "disbursedUcdAmount",
                bn_disbursedUcdAmount.round(4)
            );
            this.props.change("ethAmount", bn_ethAmount.round(18));
        } catch (error) {
            this.props.change("disbursedUcdAmount", "");
            this.props.change("ethAmount", "");
        }
    }

    onEthAmountChange(e) {
        try {
            let val = new BigNumber(e.target.value);
            let bn_loanUcdAmount = this.props.product.bn_loanCollateralRatio
                .times(this.props.rates.info.bn_ethUsdRate)
                .times(val);
            let bn_disbursedUcdAmount = bn_loanUcdAmount
                .times(this.props.product.bn_discountRate)
                .round(4);
            this.props.change(
                "disbursedUcdAmount",
                bn_disbursedUcdAmount.round(4)
            );
            this.props.change("loanUcdAmount", bn_loanUcdAmount.round(4));
        } catch (error) {
            this.props.change("disbursedUcdAmount", "");
            this.props.change("loanUcdAmount", "");
        }
    }

    render() {
        const { error, handleSubmit, pristine, submitting } = this.props;
        return (
            <Form onSubmit={handleSubmit}>
                {error && <EthSubmissionErrorPanel error={error} />}
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
