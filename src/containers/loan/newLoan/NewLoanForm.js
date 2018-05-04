/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import BigNumber from "bignumber.js";
import Button from "components/augmint-ui/button";
import { StyleLabel } from "components/augmint-ui/FormCustomLabel/styles";
import { EthSubmissionErrorPanel, ErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { Pblock } from "components/PageLayout";
import ToolTip from "components/ToolTip";
import { ONE_ETH_IN_WEI, PPM_DIV } from "utils/constants";

const ETH_DECIMALS = 5;
const TOKEN_DECIMALS = 2;
const DECIMALS_DIV = 10 ** TOKEN_DECIMALS;

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.onLoanTokenAmountChange = this.onLoanTokenAmountChange.bind(this);
        this.onRepaymentAmountAmountChange = this.onRepaymentAmountAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        // this a a workaround for validations with parameters causing issues,
        //    see https://github.com/erikras/redux-form/issues/2453#issuecomment-272483784
        this.minToken = Validations.minTokenAmount(this.props.product.minDisbursedAmountInToken);
        this.maxLoanAmount = Validations.maxLoanAmount(this.props.product.maxLoanAmount);
    }

    onLoanTokenAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value).mul(DECIMALS_DIV);
        } catch (error) {
            this.props.change("repaymentAmount", "");
            this.props.change("ethAmount", "");
            return;
        }

        const repaymentAmount = val
            .div(this.props.product.bn_discountRate)
            .mul(PPM_DIV)
            .round(0, BigNumber.ROUND_UP);

        const weiAmount = repaymentAmount
            .div(this.props.rates.info.bn_ethFiatRate)
            .mul(ONE_ETH_IN_WEI)
            .div(this.props.product.bn_collateralRatio)
            .mul(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);
        const ethAmount = weiAmount.div(ONE_ETH_IN_WEI).round(ETH_DECIMALS, BigNumber.ROUND_UP);

        this.props.change("repaymentAmount", repaymentAmount / DECIMALS_DIV);
        this.props.change("ethAmount", ethAmount.toFixed(ETH_DECIMALS));
    }

    onRepaymentAmountAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value).mul(DECIMALS_DIV);
        } catch (error) {
            this.props.change("loanTokenAmount", "");
            this.props.change("ethAmount", "");
            return;
        }

        const loanTokenAmount = val
            .mul(this.props.product.bn_discountRate)
            .div(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);

        const weiAmount = val
            .div(this.props.rates.info.bn_ethFiatRate)
            .mul(ONE_ETH_IN_WEI)
            .div(this.props.product.bn_collateralRatio)
            .mul(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);
        const ethAmount = weiAmount.div(ONE_ETH_IN_WEI).round(ETH_DECIMALS, BigNumber.ROUND_UP);

        this.props.change("loanTokenAmount", loanTokenAmount / DECIMALS_DIV);
        this.props.change("ethAmount", ethAmount.toFixed(ETH_DECIMALS));
    }

    onEthAmountChange(e) {
        let val;
        try {
            val = new BigNumber(e.target.value).mul(ONE_ETH_IN_WEI);
        } catch (error) {
            this.props.change("loanTokenAmount", "");
            this.props.change("repaymentAmount", "");
            return;
        }
        const fiatValue = val
            .mul(this.props.rates.info.bn_ethFiatRate)
            .div(ONE_ETH_IN_WEI)
            .round(0, BigNumber.ROUND_HALF_UP);

        const repaymentAmount = fiatValue
            .mul(this.props.product.bn_collateralRatio)
            .div(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);

        const loanTokenAmount = repaymentAmount
            .mul(this.props.product.bn_discountRate)
            .div(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);

        this.props.change("loanTokenAmount", loanTokenAmount / DECIMALS_DIV);
        this.props.change("repaymentAmount", repaymentAmount / DECIMALS_DIV);
    }

    render() {
        const { error, handleSubmit, pristine, submitting, clearSubmitErrors, loanManager, onSubmit } = this.props;
        const { rates } = this.props;
        const isRatesAvailable = rates && rates.info.bn_ethFiatRate * 1 > 0;
        return (
            <Pblock header="Loan parameters">
                {error && (
                    <EthSubmissionErrorPanel
                        error={error}
                        header="Create loan failed"
                        onDismiss={() => clearSubmitErrors()}
                    />
                )}
                {!isRatesAvailable && (
                    <ErrorPanel>No ETH/EUR rates available. Can't get a loan at the moment. Try agin later</ErrorPanel>
                )}
                {isRatesAvailable && (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            name="loanTokenAmount"
                            type="number"
                            disabled={submitting || !loanManager.isLoaded}
                            validate={[
                                Validations.required,
                                Validations.tokenAmount,
                                this.maxLoanAmount,
                                this.minToken
                            ]}
                            normalize={Normalizations.twoDecimals}
                            onChange={this.onLoanTokenAmountChange}
                            placeholder="pay out"
                        >
                            <StyleLabel align="left">
                                Loan amount{": "}
                                <ToolTip>
                                    Disbursed loan amount (paid out) = Repayable loan amount x Discount Rate{" "}
                                </ToolTip>
                            </StyleLabel>

                            <input data-testid="loanTokenAmountInput" style={{ borderRadius: "0" }} />
                            <StyleLabel align="right">A-EUR</StyleLabel>
                        </Field>
                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            name="repaymentAmount"
                            placeholder="to pay back"
                            type="number"
                            disabled={submitting || !loanManager.isLoaded}
                            validate={[Validations.required, Validations.tokenAmount]}
                            normalize={Normalizations.twoDecimals}
                            onChange={this.onRepaymentAmountAmountChange}
                        >
                            <StyleLabel align="left">
                                Repayment amount{": "}
                                <ToolTip>
                                    Loan A-EUR amount to be paid back = Disbursed amount x ( 1 / Discount Rate )
                                </ToolTip>
                            </StyleLabel>
                            <input data-testid="repaymentAmountInput" style={{ borderRadius: "0" }} />
                            <StyleLabel align="right">A-EUR</StyleLabel>
                        </Field>
                        <Field
                            component={Form.Field}
                            as={Form.Input}
                            name="ethAmount"
                            type="number"
                            placeholder="amount taken to escrow"
                            disabled={submitting || !loanManager.isLoaded}
                            validate={[Validations.required, Validations.ethAmount, Validations.ethUserBalance]}
                            normalize={Normalizations.fiveDecimals}
                            onChange={this.onEthAmountChange}
                        >
                            <StyleLabel align="left">
                                Collateral:{" "}
                                <ToolTip>
                                    ETH to be held as collateral = A-EUR Loan Amount / ETHEUR rate x (1 / Coverage
                                    ratio)
                                    <br />( ETH/EUR Rate = {Math.round(this.props.rates.info.ethFiatRate * 100) / 100} )
                                </ToolTip>
                            </StyleLabel>
                            <input data-testid="ethAmountInput" style={{ borderRadius: "0" }} />
                            <StyleLabel align="right">ETH</StyleLabel>
                        </Field>
                        <Button
                            size="big"
                            data-testid="submitBtn"
                            loading={submitting}
                            disabled={pristine}
                            type="submit"
                        >
                            {submitting ? "Submitting..." : "Get loan"}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}
NewLoanForm = reduxForm({
    form: "NewLoanForm"
})(NewLoanForm);

export default NewLoanForm;
