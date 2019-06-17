/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import store from "modules/store";
// import { connect } from "react-redux";

import { Menu } from "components/augmint-ui/menu";
import Button from "components/augmint-ui/button";
import { ConnectionStatus, EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Field, reduxForm, SubmissionError, change } from "redux-form";
import { Form, Normalizations, Validations } from "components/BaseComponents";
import { getSimpleBuy, PLACE_ORDER_SUCCESS, placeOrder, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
import { Pblock } from "components/PageLayout";
import { AEUR, ETH } from "components/augmint-ui/currencies.js";
import { Tokens } from "@augmint/js";

import theme from "styles/theme";
import styled from "styled-components";
import { SIMPLE_BUY_SUCCESS } from "../../../modules/reducers/orders";

const Styledlabel = styled.label`
    display: inline-block;
    margin-bottom: 5px;
`;

const StyledBox = styled.div`
    border-radius: 3px;
    box-sizing: border-box;
    width: 100%;
    padding: 15px;
    margin-bottom: 20px;
    background: rgba(232, 232, 232, 0.3);
    border: 2px solid rgba(232, 232, 232, 0.3);

    text-align: center;
    font-size: 14px;
    line-height: 200%;
    color: rgba(0, 0, 0, 0.7);

    & strong {
        font-size: 16px;
    }

    &.validation-error {
        border: 2px solid ${theme.colors.darkRed};
        background-color: ${theme.colors.lightRed};
        & strong.err {
            color: ${theme.colors.darkRed};
        }
    }
`;

class SimpleBuyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            simpleResult: null,
            result: null,
            orderDirection: TOKEN_BUY,
            liquidityError: null,
            averagePrice: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        // this.onOrderDirectionChange = this.onOrderDirectionChange.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
    }

    onOrderDirectionChange(e) {
        const orderDirection = +e.target.attributes["data-index"].value;

        this.setState({
            orderDirection
        });
        this.onTokenAmountChange(null, this.state.inputVal);
    }

    async onTokenAmountChange(e, savedValue) {
        const value = e ? e.target.value : savedValue;
        const { ethFiatRate } = this.props.rates.info;
        const isBuy = this.state.orderDirection === TOKEN_BUY;

        //TODO:  access results without store
        const simpleResult = await store.dispatch(getSimpleBuy(value, isBuy, ethFiatRate));

        if (simpleResult && simpleResult.type === SIMPLE_BUY_SUCCESS) {
            const averagePrice =
                simpleResult.result.averagePrice && ethFiatRate / simpleResult.result.averagePrice.toNumber();
            const liquidityError = this.maxExchangeValue(value, simpleResult.result.filledTokens);

            this.setState({
                simpleResult: simpleResult.result,
                averagePrice,
                liquidityError
            });
        }
    }

    maxExchangeValue(value, filledTokens) {
        const errorMsg = "Insufficient liquidity available.";
        const token_value = Tokens.of(value);
        return filledTokens.gte(token_value) ? null : errorMsg;
    }

    async handleSubmit() {
        let amount, price;
        const { orderDirection, simpleResult } = this.state;

        if (simpleResult) {
            try {
                price = simpleResult.limitPrice;
                if (orderDirection === TOKEN_BUY) {
                    amount = simpleResult.filledEthers;
                } else {
                    amount = simpleResult.filledTokens;
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
        } else {
            throw new SubmissionError({
                _error: "no amount"
            });
        }
    }

    componentDidUpdate() {
        const form = store.getState().form.PlaceOrderForm;
        const thisToken = form && form.values ? form.values.tokenAmount : undefined;
        if (this.props.token && this.props.token !== thisToken && !this.state.tokenUpdated) {
            this.props.dispatch(change("SimpleBuyForm", "simpleTokenAmount", this.props.token));
            this.setState({
                tokenUpdated: true,
                inputVal: this.props.token
            });
            this.onTokenAmountChange(null, null, this.props.token);
        }
    }

    render() {
        const {
            header: mainHeader,
            error,
            exchange,
            rates,
            handleSubmit,
            pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset,
            invalid
        } = this.props;
        const { orderDirection, result, simpleResult, liquidityError, averagePrice } = this.state;
        let buttonDisable = null;

        const tokenAmountValidations = [Validations.required, Validations.tokenAmount, Validations.minOrderTokenAmount];
        if (orderDirection === TOKEN_SELL) {
            tokenAmountValidations.push(Validations.userTokenBalance);
            buttonDisable = liquidityError;
        }
        if (orderDirection === TOKEN_BUY && simpleResult && simpleResult.filledEthers) {
            tokenAmountValidations.push(Validations.validateFilledEthers);
            buttonDisable = liquidityError || Validations.validateFilledEthers();
        }

        const isDesktop = window.innerWidth > 768;

        return (
            <Pblock
                className="simplebuy-form"
                loading={exchange.isLoading || !rates.isLoaded || (pristine && rates.isLoading)}
            >
                {header}
                <ConnectionStatus contract={exchange} />

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header="Order submitted"
                        result={result}
                        onDismiss={() => reset()}
                        data-test-orderid={result.orderId}
                    />
                )}

                {!submitSucceeded && rates.isLoaded && (
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
                            name="simpleTokenAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            inputmode="numeric"
                            step="any"
                            min="0"
                            max="1000000"
                            disabled={submitting}
                            onChange={this.onTokenAmountChange}
                            validate={tokenAmountValidations}
                            normalize={Normalizations.maxSimpleExchangeValue}
                            data-testid="simpleTokenAmountInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="A-EUR"
                            autoFocus={isDesktop}
                        />

                        {simpleResult && averagePrice && (
                            <div>
                                <StyledBox className={liquidityError ? "validation-error" : ""}>
                                    {liquidityError && (
                                        <strong className="err">
                                            {liquidityError}
                                            <br />
                                        </strong>
                                    )}
                                    {orderDirection === TOKEN_BUY ? "Buy " : "Sell "}
                                    <strong className="err">
                                        <AEUR data-testid="aeurAmount" amount={simpleResult.filledTokens} />
                                    </strong>
                                    {"  for  "}
                                    <strong>
                                        <ETH data-testid="ethAmount" amount={simpleResult.filledEthers} />
                                    </strong>
                                    <br />
                                    at an estimated exchange rate of <br />
                                    <strong>
                                        <span>1 ETH = </span>
                                        <AEUR amount={averagePrice} />
                                    </strong>
                                    .
                                </StyledBox>
                            </div>
                        )}

                        <Button
                            size="big"
                            loading={submitting}
                            disabled={pristine || invalid || buttonDisable}
                            className="fullwidth"
                            data-testid="simpleSubmitButton"
                            type="submit"
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

// const mapStateToProps = state => ({
//   userBalance: state.userBalances.account.bn_ethBalance,
//   simpleResult: state.orders.result
// })
//
// SimpleBuyForm = connect(mapStateToProps)(SimpleBuyForm)

SimpleBuyForm = reduxForm({
    form: "SimpleBuyForm",
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
})(SimpleBuyForm);

export default SimpleBuyForm;
