/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */
/* eslint-disable import/first */

import React from "react";
import ReactDOM from "react-dom";
import BigNumber from "bignumber.js";
import moment from "moment";
import Button from "components/augmint-ui/button";
import { EthSubmissionErrorPanel, ErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { AEUR, ETH } from "components/augmint-ui/currencies.js";
import styled from "styled-components";
import { connect } from "react-redux";

import theme from "styles/theme";
import { ONE_ETH_IN_WEI, PPM_DIV, ETHEUR } from "utils/constants";

const ETH_DECIMALS = 4;
const TOKEN_DECIMALS = 2;
const DECIMALS_DIV = 10 ** TOKEN_DECIMALS;

const StyledBox = styled.div`
    border-radius: 3px;
    box-sizing: border-box;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    background: rgba(232, 232, 232, 0.3);

    text-align: center;
    font-size: 14px;
    line-height: 200%;
    color: rgba(0, 0, 0, 0.7);

    & .box-val {
        display: block;
        color: black;
        font-size: 22px;
        font-weight: 800;
        margin-bottom: -4px;
        & .symbol {
            font-size: 14px;
            font-weight: 400;
        }
    }
    &.validation-error {
      border: 2px solid ${theme.colors.darkRed}
      background-color: ${theme.colors.lightRed}
      margin-bottom: 0;
      & .box-val {
        color: ${theme.colors.darkRed}
      }
    }
`;

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
            amountChanged: "",
            initialized: false,
            ethAmount: null,
            loanTokenAmount: null,
            productId: this.activeProducts[0].id
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.products !== this.props.products) {
            this.setProduct(); // needed when landing from on URL directly
        }

        // if (!this.props.rates.isLoading && !this.state.initialized) {
        //     this.initForm();
        // }
    }

    initForm() {
        const initialValues = this.calculateFromToken(this.state.loanTokenAmount);
        this.props.initialize({
            loanTokenAmount: initialValues.loanTokenAmount,
            productId: this.activeProducts[0].id
        });
        this.setState({
            repaymentAmount: initialValues.repaymentAmount,
            initialized: true,
            ethAmount: initialValues.ethAmount,
            productId: this.activeProducts[0].id
        });
    }

    componentDidMount() {
        this.setProduct(); // needed when landing from Link within App
    }

    defaultProductId() {
        let productId = this.activeProducts[0].id;
        this.props.change("productId", productId);
        return productId;
    }

    // componentWillUnmount() {
    //     this.setState({ initialized: false });
    // }

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
        const amount = e ? e.target.value : this.state.loanTokenAmount;
        const { error, loanTokenAmount, repaymentAmount, ethAmount } = this.calculateFromToken(amount);

        if (error) {
            this.props.change("ethAmount", "");
            this.setState({ repaymentAmount: "" });
        } else {
            this.props.change("ethAmount", ethAmount.toFixed(ETH_DECIMALS));
            this.setState({
                ethAmount: ethAmount,
                loanTokenAmount: loanTokenAmount,
                repaymentAmount: repaymentAmount,
                amountChanged: "A-EURO"
            });
        }
    }

    calculateFromToken(amount) {
        let val;
        let err;
        try {
            val = new BigNumber(amount).mul(DECIMALS_DIV);
        } catch (error) {
            return { error: error };
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

        return {
            error: err,
            repaymentAmount: repaymentAmount / DECIMALS_DIV,
            loanTokenAmount: amount,
            ethAmount: ethAmount
        };
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
            repaymentAmount: repaymentAmount / DECIMALS_DIV,
            loanTokenAmount: loanTokenAmount / DECIMALS_DIV,
            ethAmount: amount
        };
    }

    onEthAmountChange(e) {
        const amount = e ? e.target.value : this.state.ethAmount;
        const { error, loanTokenAmount, repaymentAmount, ethAmount } = this.calculateFromEth(amount);

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

    ethValidationError() {
        let balance = this.props.userBalances;
        if (!balance.isLoading && this.state.ethAmount) {
            let ethBalance = balance.account.ethBalance.toFixed(15);
            return this.state.ethAmount.gt(ethBalance);
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
        const { error, handleSubmit, submitting, clearSubmitErrors, loanManager, onSubmit } = this.props;
        const { rates } = this.props;
        const isRatesAvailable = rates && rates.info.bn_ethFiatRate * 1 > 0;
        // const depositInEur = (rates.info.ethFiatRate * this.state.ethAmount).toFixed(2) || 0;
        // const collateralRatio = Number((this.state.product.collateralRatio * 100).toFixed(2));
        const repayBefore = moment.unix(this.state.product.termInSecs + moment.utc().unix()).format("D MMM YYYY");
        const interestRate = Math.round(this.state.product.interestRatePa * 10000) / 100;
        const showResults = this.state.repaymentAmount ? true : false;

        const notEnoughEth = this.ethValidationError();

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
                        <StyledBox>
                            Get a new crypto-backed loan at
                            <div className="box-val">
                                {`${interestRate}% `}
                                <span className="symbol">per year (APR)</span>
                            </div>
                        </StyledBox>

                        <label>How much would you like to borrow?</label>
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
                            autoFocus={true}
                        />

                        {this.state.productId !== null && this.state.productId !== undefined && (
                            <Field
                                component={Form.Field}
                                name="productId"
                                disabled={submitting || !loanManager.isLoaded}
                                onChange={this.onSelectedLoanChange}
                                data-testid="loan-product-selector"
                                className="field-big"
                                isSelect="true"
                                selectOptions={this.activeProducts}
                                selectTestId="loan-product"
                                id={"selectedLoanProduct-" + this.state.productId}
                                onBlur={e => {
                                    console.debug(e);
                                    return;
                                }}
                            />
                        )}

                        {showResults && (
                            <div className="loan-results">
                                <StyledBox className={notEnoughEth ? "validation-error" : ""}>
                                    You will need to transfer
                                    <ETH className="box-val" data-testid="ethAmount" amount={this.state.ethAmount} />
                                    as collateral to secure this loan.
                                </StyledBox>
                                {notEnoughEth && (
                                    <p style={{ color: theme.colors.darkRed, margin: "0 0 20px 0" }}>
                                        You don't have enough ETH
                                    </p>
                                )}

                                <div>
                                    <p style={{ marginTop: 0, marginBottom: 20, lineHeight: 1.5, textAlign: "center" }}>
                                        {"Repay "}
                                        <AEUR
                                            data-testid="repaymentAmount"
                                            style={{ fontWeight: 800 }}
                                            amount={this.state.repaymentAmount}
                                        />
                                        {" by "}
                                        <strong>{repayBefore}</strong>
                                        <br />
                                        {"to get your "}
                                        <ETH amount={this.state.ethAmount} />
                                        {" collateral back."}
                                    </p>
                                </div>
                            </div>
                        )}

                        <div style={{ width: "100%", textAlign: "center" }}>
                            <Button
                                size="big"
                                data-testid="submitBtn"
                                loading={submitting}
                                disabled={notEnoughEth || !this.state.loanTokenAmount}
                                type="submit"
                                style={{
                                    height: "50px",
                                    width: "100%"
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

const mapStateToProps = state => ({
    userBalances: state.userBalances
});

NewLoanForm = reduxForm({
    form: "NewLoanForm",
    touchOnBlur: false,
    touchOnChange: true
})(NewLoanForm);
export default connect(mapStateToProps)(NewLoanForm);
