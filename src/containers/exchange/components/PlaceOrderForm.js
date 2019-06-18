/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";

import Button from "components/augmint-ui/button";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel, ConnectionStatus } from "components/MsgPanels";
import { reduxForm, Field, SubmissionError, formValueSelector, change } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { placeOrder, PLACE_ORDER_SUCCESS, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import { PriceToolTip } from "./ExchangeToolTips";
import { DECIMALS, ETH_DECIMALS } from "utils/constants";
import { Wei, Ratio, Tokens } from "@augmint/js";

import theme from "styles/theme";
import styled from "styled-components";
import "./styles.css";

const Styledlabel = styled.label`
    display: inline-block;
    margin-bottom: 5px;
`;

class PlaceOrderForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null, orderDirection: TOKEN_BUY, lastChangedAmountField: "" };
        this.handleSubmit = this.handleSubmit.bind(this);
        // this.onOrderDirectionChange = this.onOrderDirectionChange.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        this.onPriceChange = this.onPriceChange.bind(this);
        // this.toggleOrderBook = this.toggleOrderBook.bind(this);
    }

    componentDidUpdate(prevProps) {
        // recaluclate amounts displayed when published ETH/EUR rates changed
        if (prevProps.rates && prevProps.rates.info.ethFiatRate !== this.props.rates.info.ethFiatRate) {
            this.reCalcAmounts(
                this.state.lastChangedAmountField,
                this.props.price,
                this.props.tokenAmount,
                this.props.ethAmount
            );
        }

        const form = store.getState().form.PlaceOrderForm;
        const thisToken = form && form.values ? form.values.tokenAmount : undefined;
        if (this.props.token && this.props.token !== thisToken && !this.state.tokenUpdated) {
            this.props.dispatch(change("PlaceOrderForm", "tokenAmount", this.props.token));
            this.setState({
                tokenUpdated: true
            });
            this.onTokenAmountChange(null, this.props.token);
        }
    }

    onTokenAmountChange(e, savedValue) {
        const value = e ? e.target.value : savedValue;
        try {
            const lastChangedAmountField = "tokenAmount";
            this.setState({ lastChangedAmountField });
            this.reCalcAmounts(lastChangedAmountField, this.props.price, value, null);
        } catch (error) {
            this.props.change("ethAmount", "");
        }
    }

    onEthAmountChange(e) {
        try {
            const lastChangedAmountField = "ethAmount";
            this.setState({ lastChangedAmountField });
            this.reCalcAmounts(lastChangedAmountField, this.props.price, null, e.target.value);
        } catch (error) {
            this.props.change("tokenAmount", "");
        }
    }

    onPriceChange(e) {
        this.reCalcAmounts(
            this.state.lastChangedAmountField,
            e.target.value,
            this.props.tokenAmount,
            this.props.ethAmount
        );
    }

    reCalcAmounts(lastChangedAmountField, _price, _tokenAmount, _ethAmount) {
        const price = this.parsePrice(_price);

        if (lastChangedAmountField === "ethAmount") {
            const ethAmount = parseFloat(_ethAmount);
            if (!isNaN(ethAmount) && isFinite(ethAmount)) {
                const tokenValue = (ethAmount * this.props.rates.info.ethFiatRate) / price;
                this.props.change("tokenAmount", Number(tokenValue.toFixed(DECIMALS)));
            } else {
                //  ethAmount is not entered yet
                this.props.change("tokenAmount", "");
            }
        } else {
            const tokenAmount = parseFloat(_tokenAmount);
            if (!isNaN(tokenAmount) && isFinite(tokenAmount)) {
                const ethValue = (tokenAmount / this.props.rates.info.ethFiatRate) * price;
                this.props.change("ethAmount", Number(ethValue.toFixed(ETH_DECIMALS)));
            } else {
                // tokenAmount is not entered yet
                this.props.change("tokenAmount", "");
            }
        }
    }

    async handleSubmit(values) {
        let amount, price;
        const orderDirection = this.props.orderDirection;

        try {
            price = Ratio.of(values.price);
            if (orderDirection === TOKEN_BUY) {
                amount = Wei.of(values.ethAmount);
            } else {
                amount = Tokens.of(values.tokenAmount);
            }
        } catch (error) {
            throw new SubmissionError({
                _error: {
                    title: "Invalid amount",
                    details: error
                }
            });
        }

        const res = await store.dispatch(placeOrder(orderDirection, amount, price));

        if (res.type !== PLACE_ORDER_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result
            });
            return;
        }
    }

    parsePrice(price) {
        return Math.round(price * 100) / 10000;
    }

    render() {
        const {
            rates,
            exchange,
            error,
            handleSubmit,
            pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset
        } = this.props;
        const { orderDirection } = this.props;

        const ethAmountValidations = [Validations.required, Validations.ethAmount];
        if (orderDirection === TOKEN_BUY) {
            ethAmountValidations.push(Validations.ethUserBalance);
        }

        const tokenAmountValidations = [Validations.required, Validations.tokenAmount, Validations.minOrderTokenAmount];
        if (orderDirection === TOKEN_SELL) {
            tokenAmountValidations.push(Validations.userTokenBalance);
        }

        const isDesktop = window.innerWidth > 768;

        return (
            <Pblock
                className="placeOrder-form"
                loading={exchange.isLoading || !rates.isLoaded || (pristine && rates.isLoading)}
            >
                <ConnectionStatus contract={this.props.exchange} />

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Order submitted"
                        result={this.state.result}
                        onDismiss={() => reset()}
                        data-test-orderid={this.state.result.orderId}
                    />
                )}

                {!submitSucceeded && this.props.rates.isLoaded && (
                    <Form error={error ? "true" : "false"} onSubmit={handleSubmit(this.handleSubmit)}>
                        <EthSubmissionErrorPanel
                            error={error}
                            header="Place Order failed"
                            onDismiss={() => clearSubmitErrors()}
                        />

                        <Styledlabel style={{ margin: 0 }}>
                            <strong>
                                {orderDirection === TOKEN_BUY ? "A-EUR amount to buy" : "A-EUR amount to sell"}
                            </strong>
                        </Styledlabel>
                        <Field
                            name="tokenAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            inputmode="numeric"
                            step="any"
                            min="0"
                            disabled={submitting || !exchange.isLoaded}
                            onChange={this.onTokenAmountChange}
                            validate={tokenAmountValidations}
                            normalize={Normalizations.twoDecimals}
                            data-testid="tokenAmountInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="A-EUR"
                            autoFocus={isDesktop}
                        />

                        <Styledlabel style={{ margin: "5px 0 0 0" }}>
                            Price <PriceToolTip id={"place_order_form"} />
                        </Styledlabel>

                        <Field
                            name="price"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            inputmode="numeric"
                            step="any"
                            min="0"
                            info={`Calculated on current rate 1 ETH = ${(
                                rates.info.ethFiatRate / this.parsePrice(this.props.price)
                            ).toFixed(2)}A€`}
                            disabled={submitting || !exchange.isLoaded}
                            onChange={this.onPriceChange}
                            validate={Validations.price}
                            normalize={Normalizations.twoDecimals}
                            data-testid="priceInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="%"
                        />

                        <Styledlabel style={{ margin: 0 }}>
                            {orderDirection === TOKEN_BUY ? "ETH amount to sell" : "ETH amount to buy"}
                        </Styledlabel>

                        <Field
                            name="ethAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            inputmode="numeric"
                            step="any"
                            min="0"
                            disabled={submitting || !exchange.isLoaded}
                            onChange={this.onEthAmountChange}
                            validate={ethAmountValidations}
                            normalize={Normalizations.fiveDecimals}
                            data-testid="ethAmountInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="ETH"
                        />

                        <Button
                            size="big"
                            loading={submitting}
                            disabled={pristine}
                            data-testid="submitButton"
                            type="submit"
                            className={"fullwidth"}
                        >
                            {submitting && "Submitting..."}
                            {!submitting &&
                                (orderDirection === TOKEN_BUY ? "Submit buy A-EUR order" : "Submit sell A-EUR order")}
                        </Button>

                        {this.props.children}
                    </Form>
                )}
            </Pblock>
        );
    }
}

const selector = formValueSelector("PlaceOrderForm");
PlaceOrderForm = connect(state => {
    const { ethAmount, tokenAmount, price } = selector(state, "ethAmount", "tokenAmount", "price");
    return { ethAmount, tokenAmount, price }; // to get amounts for orderHelpText in render
})(PlaceOrderForm);

PlaceOrderForm = reduxForm({
    form: "PlaceOrderForm",
    touchOnBlur: false,
    touchOnChange: true,
    shouldValidate: params => {
        // workaround for issue that validations are not triggered when changing orderDirection in menu.
        // TODO: this is hack, not perfect, eg. user clicks back and forth b/w sell&buy then balance check
        //       is not always happening before submission attempt.
        //       also lot of unnecessary validation call
        if (params.props.error) {
            return false; // needed otherwise submission error is not shown
        }
        return true;
    }
})(PlaceOrderForm);

function mapStateToProps(state, ownProps) {
    return { initialValues: { price: 100 } };
}

PlaceOrderForm = connect(mapStateToProps)(PlaceOrderForm);

export default PlaceOrderForm;
