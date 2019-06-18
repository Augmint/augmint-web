/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import store from "modules/store";

import Button from "components/augmint-ui/button";
import { ConnectionStatus, EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Field, reduxForm, SubmissionError, change } from "redux-form";
import { Form, Normalizations, Validations } from "components/BaseComponents";
import { PLACE_ORDER_SUCCESS, placeOrder, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
import { Pblock } from "components/PageLayout";
import { AEUR, ETH } from "components/augmint-ui/currencies.js";
import { Tokens, Wei } from "@augmint/js";

import theme from "styles/theme";
import styled from "styled-components";

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
            marketMatch: null,
            result: null,
            orderDirection: TOKEN_BUY,
            liquidityError: null,
            averageRate: null
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFilledEthers = this.validateFilledEthers.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
    }

    async onTokenAmountChange(e, savedValue) {
        const value = e ? e.target.value : savedValue;
        const { ethFiatRate } = this.props.rates.info;
        const isBuy = this.props.orderDirection === TOKEN_BUY;

        const orderBook = store.getState().orders.orders;
        const t = Tokens.of(value);
        const r = Tokens.of(ethFiatRate);
        const marketMatch = isBuy ? orderBook.estimateMarketBuy(t, r) : orderBook.estimateMarketSell(t, r);

        if (marketMatch) {
            const averageRate = marketMatch.averagePrice && ethFiatRate / marketMatch.averagePrice.toNumber();
            const liquidityError = this.maxExchangeValue(value, marketMatch.filledTokens);

            this.setState({
                marketMatch,
                averageRate,
                liquidityError,
                inputVal: value
            });
        }
    }

    maxExchangeValue(value, filledTokens) {
        const errorMsg = "Insufficient liquidity available.";
        const token_value = Tokens.of(value);
        return filledTokens.gte(token_value) ? null : errorMsg;
    }

    validateFilledEthers() {
        const { marketMatch } = this.state;
        if (marketMatch && marketMatch.filledEthers) {
            const ethValue = marketMatch.filledEthers;
            const userBalance = store.getState().userBalances.account.bn_ethBalance;
            const weiBalance = Wei.parse(userBalance);
            return weiBalance.gte(ethValue) ? null : "Your ETH balance is less than the amount";
        }
    }

    async handleSubmit() {
        const { marketMatch } = this.state;
        const { orderDirection } = this.props;

        const price = marketMatch.limitPrice;
        const amount = orderDirection === TOKEN_BUY ? marketMatch.filledEthers : marketMatch.filledTokens;

        const res = await store.dispatch(placeOrder(orderDirection, amount, price));

        if (res.type !== PLACE_ORDER_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                result: res.result
            });
        }
    }

    componentDidUpdate(prevProps) {
        const form = store.getState().form.PlaceOrderForm;
        const thisToken = form && form.values ? form.values.tokenAmount : undefined;
        if (this.props.token && this.props.token !== thisToken && !this.state.tokenUpdated) {
            this.props.dispatch(change("SimpleBuyForm", "simpleTokenAmount", this.props.token));
            this.setState({
                tokenUpdated: true,
                inputVal: this.props.token
            });
            this.onTokenAmountChange(null, this.props.token);
        }

        if (prevProps.orderDirection !== this.props.orderDirection) {
            this.onTokenAmountChange(null, this.state.inputVal);
        }
    }

    render() {
        const {
            error,
            exchange,
            rates,
            handleSubmit,
            pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset,
            invalid,
            orderDirection
        } = this.props;
        const { result, marketMatch, liquidityError, averageRate } = this.state;

        const tokenAmountValidations = [Validations.required, Validations.tokenAmount, Validations.minOrderTokenAmount];
        if (orderDirection === TOKEN_SELL) {
            tokenAmountValidations.push(Validations.userTokenBalance);
        }
        if (orderDirection === TOKEN_BUY && marketMatch && marketMatch.filledEthers) {
            tokenAmountValidations.push(this.validateFilledEthers);
        }

        const isDesktop = window.innerWidth > 768;

        return (
            <Pblock
                className="simplebuy-form"
                loading={exchange.isLoading || !rates.isLoaded || (pristine && rates.isLoading)}
            >
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

                        {marketMatch && averageRate && (
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
                                        <AEUR data-testid="aeurAmount" amount={marketMatch.filledTokens} />
                                    </strong>
                                    {"  for  "}
                                    <strong>
                                        <ETH data-testid="ethAmount" amount={marketMatch.filledEthers} />
                                    </strong>
                                    <br />
                                    at an estimated exchange rate of <br />
                                    <strong>
                                        <span>1 ETH = </span>
                                        <AEUR amount={averageRate} />
                                    </strong>
                                    .
                                </StyledBox>
                            </div>
                        )}

                        <Button
                            size="big"
                            loading={submitting}
                            disabled={pristine || invalid || liquidityError}
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
