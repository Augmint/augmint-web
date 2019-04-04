/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */
/* eslint-disable import/first */

import React from "react";
import BigNumber from "bignumber.js";
import moment from "moment";
import Button from "components/augmint-ui/button";
import { EthSubmissionErrorPanel, ErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { Pgrid } from "components/PageLayout";
// import RadioInput from "components/augmint-ui/RadioInput";
// import ToolTip from "components/toolTip";
// import { LoanProductDetails } from "containers/loan/components/LoanProductDetails";

import theme from "styles/theme";
import { ONE_ETH_IN_WEI, PPM_DIV, ETHEUR } from "utils/constants";

const ETH_DECIMALS = 5;
const TOKEN_DECIMALS = 2;
const DECIMALS_DIV = 10 ** TOKEN_DECIMALS;

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.products = this.props.loanManager.products;
        this.activeProducts = this.props.loanManager.products
            .filter(product => product.isActive)
            .sort((p1, p2) => p2.termInSecs - p1.termInSecs);
        this.product = props.loanManager.products[this.defaultProductId()];
        this.onLoanTokenAmountChange = this.onLoanTokenAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        this.onSelectedLoanChange = this.onSelectedLoanChange.bind(this);
        this.defaultProductId = this.onSelectedLoanChange.bind(this);
        // this a a workaround for validations with parameters causing issues,
        //    see https://github.com/erikras/redux-form/issues/2453#issuecomment-272483784

        this.state = {
            product: this.product,
            minToken: Validations.minTokenAmount(this.product.minDisbursedAmountInToken),
            maxLoanAmount: Validations.maxLoanAmount(this.product.maxLoanAmount),
            repaymentAmount: 0,
            amountChanged: "ETH",
            initialized: false,
            ethAmount: 100
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.products !== this.props.products) {
            this.setProduct(); // needed when landing from on URL directly
        }
        if (!this.props.rates.isLoading && !this.state.initialized) {
            this.initForm();
        }
    }

    initForm() {
        const initialValues = this.calculateFromEth(this.state.ethAmount);
        this.props.initialize({
            ethAmount: initialValues.ethAmount,
            loanTokenAmount: initialValues.loanTokenAmount,
            productId: this.activeProducts[0].id
        });
        this.setState({ repaymentAmount: initialValues.repaymentAmount });
        this.setState({ initialized: true });
    }

    componentDidMount() {
        this.setProduct(); // needed when landing from Link within App
    }

    defaultProductId() {
        let productId = this.activeProducts[0].id;
        this.props.change("productId", productId);
        return productId;
    }

    componentWillUnmount() {
        this.setState({ initialized: false });
    }

    setProduct() {
        // workaround b/c landing directly on URL and from LoanSelector triggers different events.
        if (this.props.products == null) {
            return;
        } // not loaded yet
        let isProductFound;
        let product = this.props.products[this.state.productId];
        if (typeof product === "undefined") {
            isProductFound = false;
        } else {
            isProductFound = true;
        }
        this.setState({ isLoading: false, product: product, isProductFound: isProductFound });
    }

    onLoanTokenAmountChange(e) {
        let val;
        const amount = e ? e.target.value : this.state.loanTokenAmount;
        try {
            val = new BigNumber(amount).mul(DECIMALS_DIV);
        } catch (error) {
            this.props.change("ethAmount", "");
            this.setState({ repaymentAmount: "" });
            return;
        }

        const repaymentAmount = val
            .div(this.state.product.bn_discountRate)
            .mul(PPM_DIV)
            .round(0, BigNumber.ROUND_UP);

        const weiAmount = repaymentAmount
            .div(DECIMALS_DIV)
            .div(this.props.rates.info.bn_ethFiatRate.toNumber())
            .mul(ONE_ETH_IN_WEI)
            .div(this.state.product.bn_collateralRatio)
            .mul(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);
        const ethAmount = weiAmount.div(ONE_ETH_IN_WEI).round(ETH_DECIMALS, BigNumber.ROUND_UP);

        this.props.change("ethAmount", ethAmount.toFixed(ETH_DECIMALS));
        this.setState({
            ethAmount: ethAmount.toFixed(ETH_DECIMALS),
            loanTokenAmount: amount,
            repaymentAmount: repaymentAmount / DECIMALS_DIV,
            amountChanged: "A-EURO"
        });
    }

    calculateFromEth(amount) {
        let val;
        let err;
        try {
            val = new BigNumber(amount).mul(ONE_ETH_IN_WEI).mul(DECIMALS_DIV);
        } catch (error) {
            return { error: error };
        }
        const fiatValue = val
            .mul(this.props.rates.info.bn_ethFiatRate)
            .div(ONE_ETH_IN_WEI)
            .round(0, BigNumber.ROUND_HALF_UP);

        const repaymentAmount = fiatValue
            .mul(this.state.product.bn_collateralRatio)
            .div(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);

        const loanTokenAmount = repaymentAmount
            .mul(this.state.product.bn_discountRate)
            .div(PPM_DIV)
            .round(0, BigNumber.ROUND_DOWN);

        return {
            error: err,
            fiatValue: fiatValue,
            repaymentAmount: repaymentAmount / DECIMALS_DIV,
            loanTokenAmount: loanTokenAmount / DECIMALS_DIV,
            ethAmount: amount
        };
    }

    onEthAmountChange(e) {
        const amount = e ? e.target.value : this.state.ethAmount;
        const { error, loanTokenAmount, fiatValue, repaymentAmount, ethAmount } = this.calculateFromEth(amount);

        if (error) {
            this.props.change("loanTokenAmount", "");
            this.setState({ repaymentAmount: "" });
        } else {
            this.props.change("loanTokenAmount", loanTokenAmount);
            this.setState({
                loanTokenAmount: loanTokenAmount,
                ethAmount: ethAmount,
                repaymentAmount: repaymentAmount,
                amountChanged: "ETH"
            });
        }
    }

    onSelectedLoanChange(e) {
        let product = this.products[e.target.value];
        this.setState(
            {
                productId: e.target.value,
                product: product,
                minToken: Validations.minTokenAmount(product.minDisbursedAmountInToken),
                maxLoanAmount: Validations.maxLoanAmount(product.maxLoanAmount)
            },
            () => {
                if (this.state.amountChanged) {
                    if (this.state.amountChanged === "ETH") {
                        this.onEthAmountChange();
                    } else {
                        this.onLoanTokenAmountChange();
                    }
                }
            }
        );
    }

    render() {
        const { error, handleSubmit, pristine, submitting, clearSubmitErrors, loanManager, onSubmit } = this.props;
        const { rates } = this.props;
        const isRatesAvailable = rates && rates.info.bn_ethFiatRate * 1 > 0;
        const depositInEur = rates.info.ethFiatRate * this.state.ethAmount || 0;
        const collateralRatio = Number((this.state.product.collateralRatio * 100).toFixed(2));
        const repayBefore = moment.unix(this.state.product.termInSecs + moment.utc().unix()).format("D MMM YYYY");

        return (
            <div>
                {error && (
                    <EthSubmissionErrorPanel
                        error={error}
                        header="Create loan failed"
                        onDismiss={() => clearSubmitErrors()}
                    />
                )}
                {!isRatesAvailable && (
                    <ErrorPanel>
                        No {ETHEUR} rates available. `Can't` get a loan at the moment. Try agin later
                    </ErrorPanel>
                )}{" "}
                {isRatesAvailable && (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Pgrid>
                            <Pgrid.Row halign="justify">
                                <Pgrid.Column>
                                    <label>You deposit...</label>
                                    <Field
                                        component={Form.Field}
                                        as={Form.Input}
                                        name="ethAmount"
                                        type="number"
                                        inputmode="numeric"
                                        step="any"
                                        min="0"
                                        disabled={submitting || !loanManager.isLoaded}
                                        validate={[
                                            Validations.required,
                                            Validations.ethAmount,
                                            Validations.ethUserBalance
                                        ]}
                                        normalize={Normalizations.fiveDecimals}
                                        onChange={this.onEthAmountChange}
                                        data-testid="ethAmountInput"
                                        style={{ borderRadius: theme.borderRadius.left }}
                                        labelAlignRight="ETH"
                                        info={`Approx. ${depositInEur} EUR`}
                                        className="field-big"
                                    />
                                </Pgrid.Column>
                            </Pgrid.Row>

                            <Pgrid.Row>
                                <Pgrid.Column>
                                    <label>You borrow...</label>
                                    <Field
                                        component={Form.Field}
                                        as={Form.Input}
                                        name="loanTokenAmount"
                                        type="number"
                                        inputmode="numeric"
                                        step="any"
                                        min="0"
                                        disabled={submitting || !loanManager.isLoaded}
                                        validate={[
                                            Validations.required,
                                            Validations.tokenAmount,
                                            this.state.maxLoanAmount,
                                            this.state.minToken
                                        ]}
                                        normalize={Normalizations.twoDecimals}
                                        onChange={this.onLoanTokenAmountChange}
                                        data-testid="loanTokenAmountInput"
                                        style={{ borderRadius: theme.borderRadius.left }}
                                        labelAlignRight="A-EUR"
                                        info={`Based on ${collateralRatio}% loan-to-value ratio`}
                                    />
                                </Pgrid.Column>
                            </Pgrid.Row>

                            <Pgrid.Row halign="justify">
                                <Pgrid.Column>
                                    <label>Repay loan after...</label>
                                    <Field
                                        component={Form.Field}
                                        name="productId"
                                        disabled={submitting || !loanManager.isLoaded}
                                        onChange={this.onSelectedLoanChange}
                                        data-testid={"selectedLoanProduct-" + this.activeProducts[0].id}
                                        info={`Repay by ${repayBefore}`}
                                        className="field-big"
                                        isSelect="true"
                                        selectOptions={this.activeProducts}
                                        id={"selectedLoanProduct-" + this.activeProducts[0].id}
                                    />
                                </Pgrid.Column>
                            </Pgrid.Row>
                        </Pgrid>

                        <div
                            className="form-summary"
                            style={{
                                width: "100%",
                                display: "flex",
                                justifyContent: "space- between"
                            }}
                        >
                            <div
                                style={{
                                    width: "50%",
                                    textAlign: "left",
                                    marginBottom: "48px"
                                }}
                            >
                                <p data-testid="repaymentAmount" style={{ margin: "0" }}>
                                    <strong>{this.state.repaymentAmount || 0} A-EUR</strong>
                                </p>
                                <p style={{ margin: "0", fontSize: "14px" }}>Total repayment</p>
                            </div>
                            <div style={{ width: "50%", textAlign: "left" }}>
                                <p style={{ margin: "0", color: theme.colors.secondaryDark }}>
                                    <strong>{Math.round(this.state.product.interestRatePa * 10000) / 100}%</strong>
                                </p>
                                <p style={{ margin: "0", fontSize: "14px" }}>Annual interest rate</p>
                            </div>
                        </div>

                        <div style={{ width: "100%", textAlign: "center" }}>
                            <Button
                                size="big"
                                data-testid="submitBtn"
                                loading={submitting}
                                disabled={pristine && !this.state.initialized}
                                type="submit"
                                style={{
                                    height: "50px",
                                    padding: "10px 55px",
                                    width: "100%",
                                    maxWidth: "500px"
                                }}
                            >
                                {submitting ? "Submitting..." : "Get loan"}
                            </Button>
                        </div>
                    </Form>
                )}
            </div>
        );
    }
}

NewLoanForm = reduxForm({ form: "NewLoanForm", keepDirtyOnReinitialize: true, enableReinitialize: true })(NewLoanForm);
export default NewLoanForm;
