/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Menu, Button, Label } from "semantic-ui-react";
import store from "modules/store";
import { EthSubmissionErrorPanel, EthSubmissionSuccessPanel, ConnectionStatus } from "components/MsgPanels";
import { reduxForm, Field, SubmissionError, formValueSelector } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import { placeOrder, PLACE_ORDER_SUCCESS, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
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

    onOrderTypeChange(e, { name, index }) {
        this.setState({ orderType: index });
    }

    onTokenAmountChange(e) {
        let tokenAmount, price;
        try {
            tokenAmount = parseFloat(e.target.value);
            price = parseFloat(this.props.price);
        } catch (error) {
            this.props.change("ethAmount", "");
            return;
        }

        const ethValue = tokenAmount / price;

        this.props.change("ethAmount", Number(ethValue.toFixed(ETH_DECIMALS)));
    }

    onEthAmountChange(e) {
        let price, ethAmount;
        try {
            ethAmount = parseFloat(e.target.value);
            price = parseFloat(this.props.price);
        } catch (error) {
            this.props.change("tokenAmount", "");
            return;
        }

        const tokenValue = ethAmount * price;

        this.props.change("tokenAmount", Number(tokenValue.toFixed(TOKEN_DECIMALS)));
    }

    onPriceChange(e) {
        let price;
        try {
            price = parseFloat(e.target.value);

            if (this.state.orderType === TOKEN_BUY) {
                const ethAmount = parseFloat(this.props.ethAmount);
                const tokenValue = ethAmount * price;
                this.props.change("tokenAmount", Number(tokenValue.toFixed(TOKEN_DECIMALS)));
            } else {
                const tokenAmount = parseFloat(this.props.tokenAmount);
                const ethValue = tokenAmount / price;

                this.props.change("ethAmount", Number(ethValue.toFixed(ETH_DECIMALS)));
            }
        } catch (error) {
            // tokenAmount or ethAmount is not entered yet
            if (!isNaN(parseFloat(this.props.tokenAmount)) && isFinite(this.props.tokenAmount)) {
                this.props.change("ethAmount", "");
            } else {
                this.props.change("tokenAmount", "");
            }

            return;
        }
    }

    async handleSubmit(values) {
        let amount, price;
        const orderType = this.state.orderType;

        try {
            price = parseFloat(values.price);
            if (orderType === TOKEN_BUY) {
                amount = parseFloat(values.ethAmount);
            } else {
                amount = parseFloat(values.tokenAmount);
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
        //const fiatRate = this.props.rates.info.bn_ethFiatRate;

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
                    Buy A-EUR
                </Menu.Item>
                <Menu.Item active={orderType === TOKEN_SELL} index={TOKEN_SELL} onClick={this.onOrderTypeChange}>
                    Sell A-EUR
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
                            label={orderType === TOKEN_BUY ? `A-EUR amount: ` : "Sell amount: "}
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
                            <Label>A-EUR</Label>
                        </Field>

                        <Field
                            name="ethAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            label={orderType === TOKEN_BUY ? "ETH amount to sell: " : `ETH amount: `}
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
                            <Label>A-EUR / ETH</Label>
                        </Field>

                        <Button size="big" primary loading={submitting} disabled={pristine}>
                            {submitting && "Submitting..."}
                            {!submitting &&
                                (orderType === TOKEN_BUY ? "Submit buy A-EUR order" : "Submit sell A-EUR order")}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

const selector = formValueSelector("PlaceOrderForm");
function mapStateToProps(state) {
    return { initialValues: { price: 1 } }; //state.rates.info.bn_ethFiatRate.toNumber() } };
}

// couldn't make this work here, it has been added to the PlaceOrderForm component embed in index.js
// function mapStateToProps(state, ownProps) {
//   return {
//     initialValues: {
//       first_name: ownProps.propThatHasFirstName
//     }
// }

PlaceOrderForm = connect(state => {
    const { ethAmount, tokenAmount, price } = selector(state, "ethAmount", "tokenAmount", "price");
    return { ethAmount, tokenAmount, price }; // to get amounts for orderHelpText in render
})(PlaceOrderForm);

PlaceOrderForm = connect(mapStateToProps)(PlaceOrderForm);

export default reduxForm({
    form: "PlaceOrderForm",
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
