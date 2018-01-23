/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Menu, Button, Label, Message } from "semantic-ui-react";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel, ConnectionStatus } from "components/MsgPanels";
import { reduxForm, Field, SubmissionError, formValueSelector } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { placeOrder, PLACE_ORDER_SUCCESS, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
import BigNumber from "bignumber.js";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";

const ETH_DECIMALS = 5;
const TOKEN_DECIMALS = 2;

const ethValidations = [Validations.required, Validations.ethAmount];
const tokenValidations = [Validations.required, Validations.tokenAmount];
const tokenValidationsWithBalance = [...tokenValidations, Validations.userTokenBalance];
const ethValidationsWithBalance = [...ethValidations, Validations.ethUserBalance];

class PlaceOrderForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null, orderType: TOKEN_BUY };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onOrderTypeChange = this.onOrderTypeChange.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
    }

    onOrderTypeChange(e, { name, index }) {
        this.setState({ orderType: index });
    }

    onTokenAmountChange(e) {
        let bn_tokenAmount;
        try {
            bn_tokenAmount = new BigNumber(e.target.value); //.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP);
        } catch (error) {
            this.props.change("tokenAmount", "");
            this.props.change("ethAmount", "");
            return;
        }

        let bn_ethAmount = bn_tokenAmount.div(this.props.rates.info.bn_ethFiatRate);

        this.props.change(
            "ethAmount",
            bn_ethAmount.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP) //.toFixed(18)
        );
    }

    onEthAmountChange(e) {
        let bn_ethAmount;
        try {
            bn_ethAmount = new BigNumber(e.target.value); //.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP);
        } catch (error) {
            this.props.change("tokenAmount", "");
            this.props.change("ethAmount", "");
            return;
        }

        let bn_tokenAmount = bn_ethAmount.times(this.props.rates.info.bn_ethFiatRate);

        this.props.change(
            "tokenAmount",
            bn_tokenAmount.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP) //.toFixed(18)
        );
    }

    async handleSubmit(values) {
        let amount;
        let orderType = this.state.orderType;
        try {
            if (orderType === TOKEN_BUY) {
                amount = new BigNumber(values.ethAmount);
            } else {
                amount = new BigNumber(values.tokenAmount);
            }
        } catch (error) {
            throw new SubmissionError({
                _error: {
                    title: "Invalid amount",
                    details: error
                }
            });
        }

        let res = await store.dispatch(placeOrder(orderType, amount));
        if (res.type !== PLACE_ORDER_SUCCESS) {
            throw new SubmissionError({
                _error: {
                    title: "Ethereum transaction Failed",
                    details: res.error,
                    eth: res.eth
                }
            });
        } else {
            this.setState({
                result: res.result
            });
            return;
        }
    }

    render() {
        const {
            error,
            handleSubmit,
            pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset,
            tokenAmount,
            ethAmount
        } = this.props;
        const { isLoading } = this.props.exchange;
        const { orderCount, bn_totalTokenSellOrders, bn_totalEthSellOrders, totalCcy } = this.props.exchange.info;
        const { orderType } = this.state;

        let orderHelpText;
        try {
            let bn_tokenAmount = new BigNumber(tokenAmount);
            let bn_ethAmount = new BigNumber(ethAmount);

            if (orderCount === 0)
                orderHelpText = (
                    <p>
                        There are no open orders.<br />
                        You will place an order on market rate.
                    </p>
                );
            else if (
                (bn_totalTokenSellOrders.isZero() && orderType === TOKEN_BUY) ||
                (bn_totalEthSellOrders.isZero() && orderType === TOKEN_SELL)
            )
                orderHelpText = (
                    <p>
                        Currently there are only sell {totalCcy} orders open.<br />
                        Your will add an order on market rate.
                    </p>
                );
            else if (
                (bn_totalTokenSellOrders.gte(bn_tokenAmount) && orderType === TOKEN_BUY) ||
                (bn_totalEthSellOrders.gte(bn_ethAmount) && orderType === TOKEN_SELL)
            )
                orderHelpText = (
                    <p>
                        Current open sell {totalCcy} orders will fully cover your order.<br />
                        The whole amount of your order will be immediately filled.
                    </p>
                );
            else if (
                (bn_totalTokenSellOrders.lte(bn_tokenAmount) && orderType === TOKEN_BUY) ||
                (bn_totalEthSellOrders.lte(bn_ethAmount) && orderType === TOKEN_SELL)
            ) {
                // TODO: let difference;
                // if (orderType == ETHSELL) {
                //     difference = bnTotalTokenSellOrders
                // }
                orderHelpText = (
                    <p>
                        Current open sell ETH orders only partially will cover your order.<br />
                        The rest of your order will be placed as a market order.
                    </p>
                );
            }
        } catch (error) {
            // it's likely a bignumber conversion error, we ignore it
        }
        let header = (
            <Menu size="massive" tabular>
                <Menu.Item active={orderType === TOKEN_BUY} index={TOKEN_BUY} onClick={this.onOrderTypeChange}>
                    Buy ACE
                </Menu.Item>
                <Menu.Item active={orderType === TOKEN_SELL} index={TOKEN_SELL} onClick={this.onOrderTypeChange}>
                    Sell ACE
                </Menu.Item>
            </Menu>
        );

        return (
            <Pblock loading={isLoading} header={header}>
                <ConnectionStatus contract={this.props.exchange} />

                {submitSucceeded && (
                    <EthSubmissionSuccessPanel
                        header={<h3>Successful order</h3>}
                        eth={this.state.result.eth}
                        onDismiss={() => reset()}
                    >
                        <p>Order id: {this.state.result.orderId}</p>
                    </EthSubmissionSuccessPanel>
                )}

                {!submitSucceeded && (
                    <Form error={error ? true : false} onSubmit={handleSubmit(this.handleSubmit)}>
                        <EthSubmissionErrorPanel
                            error={error}
                            header={<h3>Transfer failed</h3>}
                            onDismiss={() => clearSubmitErrors()}
                        />

                        <Field
                            name="tokenAmount"
                            label={orderType === TOKEN_BUY ? "Buy: " : "Sell: "}
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            disabled={submitting || isLoading}
                            onChange={this.onTokenAmountChange}
                            validate={orderType === TOKEN_SELL ? tokenValidationsWithBalance : tokenValidations}
                            normalize={Normalizations.twoDecimals}
                            labelPosition="right"
                        >
                            <input />
                            <Label>ACE</Label>
                        </Field>

                        <Field
                            name="ethAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            label="for: "
                            disabled={submitting || isLoading}
                            onChange={this.onEthAmountChange}
                            validate={orderType === TOKEN_BUY ? ethValidationsWithBalance : ethValidations}
                            normalize={Normalizations.fiveDecimals}
                            labelPosition="right"
                        >
                            <input />
                            <Label>ETH</Label>
                        </Field>
                        {orderHelpText && <Message icon="info" size="tiny" info content={orderHelpText} />}
                        <Button size="big" primary loading={submitting} disabled={pristine}>
                            {submitting && "Submitting..."}
                            {!submitting && (orderType === TOKEN_BUY ? "Place buy ACE order" : "Place sell ACE order")}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

const selector = formValueSelector("PlaceOrderForm");

PlaceOrderForm = connect(state => {
    const { ethAmount, tokenAmount } = selector(state, "ethAmount", "tokenAmount");
    return { ethAmount, tokenAmount }; // to get amounts for orderHelpText in render
})(PlaceOrderForm);

export default reduxForm({
    form: "PlaceOrderForm",
    shouldValidate: params => {
        // workaround for issue that validations are not triggered when changing orderType in menu.
        // TODO: this is hack, not perferct, eg. user clicks back and forth b/w sell&buy then balance check is not always happening before submission attempt.
        //       also lot of unnecessary validation call
        if (params.props.error) {
            return false; // needed otherwise submission error is not shown
        }
        return true;
    }
})(PlaceOrderForm);
