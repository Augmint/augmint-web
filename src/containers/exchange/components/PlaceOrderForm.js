/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Menu, Button, Label } from "semantic-ui-react";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel, ConnectionStatus, InfoPanel } from "components/MsgPanels";
import { reduxForm, Field, SubmissionError, formValueSelector } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { placeOrder, PLACE_ORDER_SUCCESS, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
import BigNumber from "bignumber.js";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";

const ETH_DECIMALS = 8;
const TOKEN_DECIMALS = 4;

class PlaceOrderForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null, orderType: TOKEN_BUY };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onOrderTypeChange = this.onOrderTypeChange.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
        this.onPriceChange = this.onPriceChange.bind(this);
    }
    //
    // componentDidMount() {
    //     this.props.change("price", "1");
    // }

    onOrderTypeChange(e, { name, index }) {
        this.setState({ orderType: index });
    }

    onTokenAmountChange(e) {
        let bn_tokenAmount;
        try {
            bn_tokenAmount = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("ethAmount", "");
            return;
        }
        const bn_price = new BigNumber(this.props.price); //.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP);
        const fiatRate = this.props.rates.info.bn_ethFiatRate;

        let ethValue;
        if (this.state.orderType === TOKEN_BUY) {
            ethValue = new BigNumber(bn_tokenAmount).mul(bn_price).div(fiatRate);
        } else {
            ethValue = new BigNumber(bn_tokenAmount).div(bn_price).div(fiatRate);
        }

        this.props.change(
            "ethAmount",
            ethValue.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP).toString() //.toFixed(18)
        );
    }

    onEthAmountChange(e) {
        let bn_price, bn_ethAmount;
        try {
            bn_ethAmount = new BigNumber(e.target.value);
        } catch (error) {
            this.props.change("tokenAmount", "");
            return;
        }

        bn_price = new BigNumber(this.props.price); //.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP);
        const fiatRate = this.props.rates.info.bn_ethFiatRate;
        let tokenValue;
        if (this.state.orderType === TOKEN_BUY) {
            tokenValue = new BigNumber(bn_ethAmount).mul(fiatRate).div(bn_price);
        } else {
            tokenValue = new BigNumber(bn_ethAmount).mul(fiatRate).mul(bn_price);
        }

        this.props.change(
            "tokenAmount",
            tokenValue.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP).toString() //.toFixed(18)
        );
    }

    onPriceChange(e) {
        // TODO
        let bn_price;
        try {
            bn_price = new BigNumber(e.target.value); //.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP);

            const fiatRate = this.props.rates.info.bn_ethFiatRate;
            if (this.state.orderType === TOKEN_BUY) {
                const bn_ethAmount = new BigNumber(this.props.ethAmount);

                const tokenValue = new BigNumber(bn_ethAmount).div(bn_price).mul(fiatRate);
                this.props.change(
                    "tokenAmount",
                    tokenValue.round(TOKEN_DECIMALS, BigNumber.ROUND_HALF_UP).toString() //.toFixed(18)
                );
            } else {
                const bn_tokenAmount = new BigNumber(this.props.tokenAmount);
                const ethValue = new BigNumber(bn_tokenAmount).mul(bn_price).div(fiatRate);
                this.props.change(
                    "ethAmount",
                    ethValue.round(ETH_DECIMALS, BigNumber.ROUND_HALF_UP).toString() //.toFixed(18)
                );
            }
        } catch (error) {
            // tokenAmount or ethAmount is not entered yet
            if (this.state.orderType === TOKEN_BUY) {
                this.props.change("tokenAmount", "");
            } else {
                this.props.change("ethAmount", "");
            }
            return;
        }
    }

    async handleSubmit(values) {
        let amount;
        const orderType = this.state.orderType;
        const price = values.price;
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

        const res = await store.dispatch(placeOrder(orderType, amount, price));
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
        const { error, handleSubmit, pristine, submitting, submitSucceeded, clearSubmitErrors, reset } = this.props;
        const { isLoading } = this.props.exchange;
        const { orderType } = this.state;
        const fiatRate = this.props.rates.info.bn_ethFiatRate;

        const ethAmountValidations = [Validations.required, Validations.ethAmount];
        if (orderType === TOKEN_BUY) {
            ethAmountValidations.push(Validations.ethUserBalance);
        }

        const tokenAmountValidations = [Validations.required, Validations.tokenAmount, Validations.minOrderTokenAmount];
        if (orderType === TOKEN_SELL) {
            tokenAmountValidations.push(Validations.userTokenBalance);
        }

        const header = (
            <Menu size="massive" tabular>
                <Menu.Item active={orderType === TOKEN_BUY} index={TOKEN_BUY} onClick={this.onOrderTypeChange}>
                    Buy A&#8209;EUR
                </Menu.Item>
                <Menu.Item active={orderType === TOKEN_SELL} index={TOKEN_SELL} onClick={this.onOrderTypeChange}>
                    Sell A&#8209;EUR
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
                            label={
                                orderType === TOKEN_BUY
                                    ? `A&#8209;EUR amount expected on ${fiatRate} ETH/EUR rate: `
                                    : "Sell amount: "
                            }
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            disabled={submitting || isLoading}
                            onChange={this.onTokenAmountChange}
                            validate={tokenAmountValidations}
                            normalize={Normalizations.fourDecimals}
                            labelPosition="right"
                        >
                            <input />
                            <Label>
                                A&#8209;EUR
                            </Label>
                        </Field>

                        <Field
                            name="ethAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            label={
                                orderType === TOKEN_BUY
                                    ? "ETH amount to sell: "
                                    : `Expected ETH amount on ${fiatRate} ETH/EUR rate: `
                            }
                            disabled={submitting || isLoading}
                            onChange={this.onEthAmountChange}
                            validate={ethAmountValidations}
                            normalize={Normalizations.eightDecimals}
                            labelPosition="right"
                        >
                            <input />
                            <Label>ETH</Label>
                        </Field>

                        <Field
                            name="price"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            label="price: "
                            disabled={submitting || isLoading}
                            onChange={this.onPriceChange}
                            validate={Validations.price}
                            normalize={Normalizations.fourDecimals}
                            labelPosition="right"
                        >
                            <input />
                            <Label>
                                A&#8209;EUR / EUR
                            </Label>
                        </Field>

                        <InfoPanel size="tiny" info>
                            TODO: explain ...
                        </InfoPanel>

                        <Button size="big" primary loading={submitting} disabled={pristine}>
                            {submitting && "Submitting..."}
                            {!submitting &&
                                (orderType === TOKEN_BUY
                                    ? "Submit buy A&#8209;EUR order"
                                    : "Submit sell A&#8209;EUR order")}
                        </Button>
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

export default reduxForm({
    form: "PlaceOrderForm",
    initialValues: { price: 1 },
    shouldValidate: params => {
        // workaround for issue that validations are not triggered when changing orderType in menu.
        // TODO: this is hack, not perfect, eg. user clicks back and forth b/w sell&buy then balance check
        //       is not always happening before submission attempt.
        //       also lot of unnecessary validation call
        if (params.props.error) {
            return false; // needed otherwise submission error is not shown
        }
        return true;
    }
})(PlaceOrderForm);
