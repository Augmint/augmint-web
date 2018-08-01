/*
TODO: form client side validation. min loan amount, eth balance
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import BigNumber from "bignumber.js";
import Button from "components/augmint-ui/button";
import { EthSubmissionErrorPanel, ErrorPanel } from "components/MsgPanels";
import { Field, reduxForm } from "redux-form";
import RadioInput from "components/augmint-ui/RadioInput";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import ToolTip from "components/toolTip";
import LoanProductDetails from "containers/loan/components/LoanProductDetails";
import { Pgrid } from "components/PageLayout";

import theme from "styles/theme";

import { ONE_ETH_IN_WEI, PPM_DIV } from "utils/constants";

const ETH_DECIMALS = 5;
const TOKEN_DECIMALS = 2;
const DECIMALS_DIV = 10 ** TOKEN_DECIMALS;

class NewLoanForm extends React.Component {
    constructor(props) {
        super(props);
        this.products = this.props.loanManager.products;
        this.activeProducts = this.props.loanManager.products
            .filter(product => product.isActive)
            .sort((p1, p2) => p1.termInSecs < p2.termInSecs);
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
            amountChanged: ""
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.products !== this.props.products) {
            this.setProduct(); // needed when landing from on URL directly
        }
    }

    componentDidMount() {
        this.setProduct(); // needed when landing from Link within App
    }

    defaultProductId() {
        let productId = this.activeProducts[0].id;

        this.props.change("productId", productId);

        return productId;
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
        this.setState({
            isLoading: false,
            product: product,
            isProductFound: isProductFound
        });
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
            loanTokenAmount: amount,
            repaymentAmount: repaymentAmount / DECIMALS_DIV,
            amountChanged: "A-EURO"
        });
    }

    onEthAmountChange(e) {
        let val;
        const amount = e ? e.target.value : this.state.ethAmount;
        try {
            val = new BigNumber(amount).mul(ONE_ETH_IN_WEI).mul(DECIMALS_DIV);
        } catch (error) {
            this.props.change("loanTokenAmount", "");
            this.setState({ repaymentAmount: "" });
            return;
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

        this.props.change("loanTokenAmount", loanTokenAmount / DECIMALS_DIV);
        this.setState({
            ethAmount: amount,
            repaymentAmount: repaymentAmount / DECIMALS_DIV,
            amountChanged: "ETH"
        });
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
                    <ErrorPanel>No ETH/EUR rates available. Can't get a loan at the moment. Try agin later</ErrorPanel>
                )}
                {isRatesAvailable && (
                    <Form onSubmit={handleSubmit(onSubmit)}>
                        <Pgrid>
                            <Pgrid.Row halign="justify">
                                <Pgrid.Column size={{ tablet: 1, desktop: 1 / 2 }}>
                                    <label>
                                        A-EUR amount to loan
                                        <ToolTip id={"loan_amount"}>
                                            Disbursed loan amount (paid out) = Repayable loan amount - Interest amount<br />
                                            Interest amount = Disbursed loan amount x Interest rate per annum / 365 x
                                            Loan term in days
                                        </ToolTip>
                                    </label>
                                    <Field
                                        component={Form.Field}
                                        as={Form.Input}
                                        name="loanTokenAmount"
                                        type="number"
                                        disabled={submitting || !loanManager.isLoaded}
                                        validate={[
                                            Validations.required,
                                            Validations.tokenAmount,
                                            this.state.maxLoanAmount,
                                            this.state.minToken
                                        ]}
                                        normalize={Normalizations.twoDecimals}
                                        onChange={this.onLoanTokenAmountChange}
                                        placeholder="pay out"
                                        data-testid="loanTokenAmountInput"
                                        style={{ borderRadius: theme.borderRadius.left }}
                                        labelAlignRight="A-EUR"
                                    />
                                </Pgrid.Column>
                                <Pgrid.Column size={{ tablet: 1, desktop: 1 / 2 }}>
                                    <label>
                                        ETH amount to collateral
                                        <ToolTip id={"collateral"}>
                                            ETH to be held as collateral = A-EUR Loan Amount / ETHEUR rate x (1 /
                                            Coverage ratio)
                                            <br />( ETH/EUR Rate ={" "}
                                            {Math.round(this.props.rates.info.ethFiatRate * 100) / 100} )
                                        </ToolTip>
                                    </label>
                                    <Field
                                        component={Form.Field}
                                        as={Form.Input}
                                        name="ethAmount"
                                        type="number"
                                        placeholder="amount taken to escrow"
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
                                    />
                                </Pgrid.Column>
                            </Pgrid.Row>
                        </Pgrid>

                        <Pgrid>
                            <Pgrid.Row halign="center">
                                {this.activeProducts &&
                                    this.activeProducts.map((product, index) => {
                                        let label = (
                                            <div>
                                                Repay in <h4 style={{ margin: 0 }}>{product.termText}</h4>
                                            </div>
                                        );
                                        return (
                                            <Pgrid.Column
                                                size={{ mobile: 1, tablet: 1 / 2, desktop: 1 / 3 }}
                                                style={{ padding: "5px 0" }}
                                            >
                                                <Field
                                                    name="productId"
                                                    data-testid={"selectLoanProduct-" + product.id}
                                                    id={"selectLoanProduct-" + product.id}
                                                    val={product.id}
                                                    defaultChecked={!index}
                                                    component={RadioInput}
                                                    isButtonStyle={true}
                                                    label={label}
                                                    onChange={this.onSelectedLoanChange}
                                                />
                                            </Pgrid.Column>
                                        );
                                    })}
                            </Pgrid.Row>
                        </Pgrid>

                        <LoanProductDetails
                            product={this.state.product}
                            repaymentAmount={this.state.repaymentAmount || 0}
                        />
                        <div style={{ textAlign: "right", width: "100%" }}>
                            <Button
                                size="big"
                                data-testid="submitBtn"
                                loading={submitting}
                                disabled={pristine}
                                type="submit"
                                style={{ height: "auto", padding: "10px 55px" }}
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
NewLoanForm = reduxForm({
    form: "NewLoanForm"
})(NewLoanForm);

export default NewLoanForm;
