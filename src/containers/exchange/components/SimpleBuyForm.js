/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import store from "modules/store";

import { Menu } from "components/augmint-ui/menu";
import Button from "components/augmint-ui/button";
import { ConnectionStatus, EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Field, formValueSelector, reduxForm, SubmissionError } from "redux-form";
import { Form, Normalizations, Validations } from "components/BaseComponents";
import { getSimpleBuy, PLACE_ORDER_SUCCESS, placeOrder, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import BigNumber from "bignumber.js";
import { AEUR, ETH } from "components/augmint-ui/currencies.js";

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
        margin-bottom: 0;
        & strong {
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
            orders: [],
            orderList: []
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onOrderDirectionChange = this.onOrderDirectionChange.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
    }

    onOrderDirectionChange(e) {
        const orderDirection = +e.target.attributes["data-index"].value;

        const orders =
            orderDirection === TOKEN_BUY ? this.props.orders.orders.sellOrders : this.props.orders.orders.buyOrders;
        this.setState({
            orderDirection,
            orders,
            orderList: []
        });
    }

    async getSimpleResult(token) {
        const { ethFiatRate } = this.props.rates.info;
        const bn_ethFiatRate = ethFiatRate !== null && new BigNumber(ethFiatRate);
        const isBuy = this.state.orderDirection === TOKEN_BUY;

        const res = await store.dispatch(getSimpleBuy(token, isBuy, bn_ethFiatRate));

        if (res.type !== SIMPLE_BUY_SUCCESS) {
            throw new SubmissionError({
                _error: res.error
            });
        } else {
            this.setState({
                simpleResult: res.result
            });
            return;
        }
    }

    onTokenAmountChange(e) {
        const value = e.target.value;
        const simpleResult = value > 0 ? this.getSimpleResult(parseFloat(value)) : null;

        this.setState({
            simpleResult
        });
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
            reset
        } = this.props;
        const { orderDirection, result, simpleResult } = this.state;

        const ethAmountValidations = [Validations.required, Validations.ethAmount];
        if (orderDirection === TOKEN_BUY) {
            ethAmountValidations.push(Validations.ethUserBalance);
        }

        const tokenAmountValidations = [
            Validations.required,
            Validations.tokenAmount,
            Validations.ethAmount,
            Validations.minOrderTokenAmount
        ];
        if (orderDirection === TOKEN_SELL) {
            tokenAmountValidations.push(Validations.userTokenBalance);
        } else {
            tokenAmountValidations.push(Validations.ethUserBalance);
        }

        // todo button disable
        let notEnoughEth = simpleResult ? simpleResult.ethers : null;

        const header = (
            <div>
                {mainHeader}
                <Menu className="filled">
                    <Menu.Item
                        active={orderDirection === TOKEN_BUY}
                        data-index={TOKEN_BUY}
                        onClick={this.onOrderDirectionChange}
                        data-testid="simpleBuyMenuLink"
                        className={"buySell filled dark"}
                    >
                        Buy A-EUR
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === TOKEN_SELL}
                        data-index={TOKEN_SELL}
                        onClick={this.onOrderDirectionChange}
                        data-testid="simpleSellMenuLink"
                        className={"buySell filled dark"}
                    >
                        Sell A-EUR
                    </Menu.Item>
                </Menu>
            </div>
        );

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
                            disabled={submitting}
                            onChange={this.onTokenAmountChange}
                            validate={tokenAmountValidations}
                            normalize={Normalizations.twoDecimals}
                            data-testid="simpleTokenAmountInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="A-EUR"
                        />

                        {simpleResult && (
                            <div>
                                <StyledBox>
                                    You can {orderDirection === TOKEN_BUY ? "buy " : "sell "} <br />
                                    <strong>
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
                                        <AEUR amount={250} /> {/*todo*/}
                                    </strong>
                                    .
                                </StyledBox>
                            </div>
                        )}

                        {this.props.children}

                        <Button
                            size="big"
                            loading={submitting}
                            disabled={pristine}
                            className="fullwidth"
                            data-testid="simpleSubmitButton"
                            type="submit"
                        >
                            {submitting && "Submitting..."}
                            {!submitting &&
                                (orderDirection === TOKEN_BUY ? "Submit buy A-EUR order" : "Submit sell A-EUR order")}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

const selector = formValueSelector("PlaceOrderForm");
SimpleBuyForm = connect(state => {
    const { ethAmount, tokenAmount } = selector(state, "ethAmount", "tokenAmount");
    return { ethAmount, tokenAmount }; // to get amounts for orderHelpText in render
})(SimpleBuyForm);

SimpleBuyForm = reduxForm({
    form: "SimpleBuyForm",
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
