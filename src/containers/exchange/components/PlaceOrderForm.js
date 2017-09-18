/*
TODO: form client side validation. eg:
    - UCD / ETH balance check
    - number  format check
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Menu, Button, Label, Message } from "semantic-ui-react";
import store from "modules/store";
import {
    EthSubmissionErrorPanel,
    EthSubmissionSuccessPanel,
    ConnectionStatus
} from "components/MsgPanels";
import {
    reduxForm,
    Field,
    SubmissionError,
    formValueSelector
} from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
import {
    placeOrder,
    PLACE_ORDER_SUCCESS,
    ETHSELL,
    UCDSELL
} from "modules/reducers/orders";
import BigNumber from "bignumber.js";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";

const ETH_DECIMALS = 5;
const UCD_DECIMALS = 2;

const ethValidations = [Validations.required, Validations.ethAmount];
const ucdValidations = [Validations.required, Validations.ucdAmount];
const ucdValidationsWithBalance = [
    ...ucdValidations,
    Validations.ucdUserBalance
];
const ethValidationsWithBalance = [
    ...ethValidations,
    Validations.ethUserBalance
];

class PlaceOrderForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null, orderType: ETHSELL };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onOrderTypeChange = this.onOrderTypeChange.bind(this);
        this.onUcdAmountChange = this.onUcdAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
    }

    onOrderTypeChange(e, { name, index }) {
        this.setState({ orderType: index });
    }

    onUcdAmountChange(e) {
        let bn_ucdAmount;
        try {
            bn_ucdAmount = new BigNumber(e.target.value); //.round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP);
        } catch (error) {
            this.props.change("ucdAmount", "");
            this.props.change("ethAmount", "");
            return;
        }

        let bn_ethAmount = bn_ucdAmount.div(
            this.props.rates.info.bn_ethUsdRate
        );

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
            this.props.change("ucdAmount", "");
            this.props.change("ethAmount", "");
            return;
        }

        let bn_ucdAmount = bn_ethAmount.times(
            this.props.rates.info.bn_ethUsdRate
        );

        this.props.change(
            "ucdAmount",
            bn_ucdAmount.round(UCD_DECIMALS, BigNumber.ROUND_HALF_UP) //.toFixed(18)
        );
    }

    async handleSubmit(values) {
        let amount;
        let orderType = this.state.orderType;
        try {
            if (orderType === ETHSELL) {
                amount = new BigNumber(values.ethAmount);
            } else {
                amount = new BigNumber(values.ucdAmount);
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
            ucdAmount,
            ethAmount
        } = this.props;
        const { isLoading } = this.props.exchange;
        const {
            orderCount,
            bn_totalUcdSellOrders,
            bn_totalEthSellOrders,
            totalCcy
        } = this.props.exchange.info;
        const { orderType } = this.state;

        let orderHelpText;
        try {
            let bn_ucdAmount = new BigNumber(ucdAmount);
            let bn_ethAmount = new BigNumber(ethAmount);

            if (orderCount === 0)
                orderHelpText = (
                    <p>
                        There are no open orders.<br />
                        You will place an order on market rate.
                    </p>
                );
            else if (
                (bn_totalUcdSellOrders.isZero() && orderType === ETHSELL) ||
                (bn_totalEthSellOrders.isZero() && orderType === UCDSELL)
            )
                orderHelpText = (
                    <p>
                        Currently there are only sell {totalCcy} orders open.<br />
                        Your will add an order on market rate.
                    </p>
                );
            else if (
                (bn_totalUcdSellOrders.gte(bn_ucdAmount) &&
                    orderType === ETHSELL) ||
                (bn_totalEthSellOrders.gte(bn_ethAmount) &&
                    orderType === UCDSELL)
            )
                orderHelpText = (
                    <p>
                        Current open sell {totalCcy} orders will fully cover
                        your order.<br />
                        The whole amount of your order will be immediately
                        filled.
                    </p>
                );
            else if (
                (bn_totalUcdSellOrders.lte(bn_ucdAmount) &&
                    orderType === ETHSELL) ||
                (bn_totalEthSellOrders.lte(bn_ethAmount) &&
                    orderType === UCDSELL)
            ) {
                // TODO: let difference;
                // if (orderType == ETHSELL) {
                //     difference = bnTotalUcdSellOrders
                // }
                orderHelpText = (
                    <p>
                        Current open sell ETH orders only partially will cover
                        your order.<br />
                        The rest of your order will be placed as a market order.
                    </p>
                );
            }
        } catch (error) {
            // it's likely a bignumber conversion error, we ignore it
        }
        let header = (
            <Menu size="massive" tabular>
                <Menu.Item
                    active={orderType === ETHSELL}
                    index={ETHSELL}
                    onClick={this.onOrderTypeChange}
                >
                    Buy UCD
                </Menu.Item>
                <Menu.Item
                    active={orderType === UCDSELL}
                    index={UCDSELL}
                    onClick={this.onOrderTypeChange}
                >
                    Sell UCD
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
                    <Form
                        error={error ? true : false}
                        onSubmit={handleSubmit(this.handleSubmit)}
                    >
                        <EthSubmissionErrorPanel
                            error={error}
                            header={<h3>Transfer failed</h3>}
                            onDismiss={() => clearSubmitErrors()}
                        />

                        <Field
                            name="ucdAmount"
                            label={orderType === ETHSELL ? "Buy: " : "Sell: "}
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            disabled={submitting || isLoading}
                            onChange={this.onUcdAmountChange}
                            validate={
                                orderType === UCDSELL
                                    ? ucdValidationsWithBalance
                                    : ucdValidations
                            }
                            normalize={Normalizations.ucdAmount}
                            labelPosition="right"
                        >
                            <input />
                            <Label>UCD</Label>
                        </Field>

                        <Field
                            name="ethAmount"
                            component={Form.Field}
                            as={Form.Input}
                            type="number"
                            label="for: "
                            disabled={submitting || isLoading}
                            onChange={this.onEthAmountChange}
                            validate={
                                orderType === ETHSELL
                                    ? ethValidationsWithBalance
                                    : ethValidations
                            }
                            normalize={Normalizations.ethAmount}
                            labelPosition="right"
                        >
                            <input />
                            <Label>ETH</Label>
                        </Field>
                        {orderHelpText && (
                            <Message
                                icon="info"
                                size="tiny"
                                info
                                content={orderHelpText}
                            />
                        )}
                        <Button
                            size="big"
                            primary
                            loading={submitting}
                            disabled={pristine}
                        >
                            {submitting && "Submitting..."}
                            {!submitting &&
                                (orderType === ETHSELL
                                    ? "Place buy UCD order"
                                    : "Place sell UCD order")}
                        </Button>
                    </Form>
                )}
            </Pblock>
        );
    }
}

const selector = formValueSelector("PlaceOrderForm");

PlaceOrderForm = connect(state => {
    const { ethAmount, ucdAmount } = selector(state, "ethAmount", "ucdAmount");
    return { ethAmount, ucdAmount };  // to get amounts for orderHelpText in render
})(PlaceOrderForm);

export default reduxForm({
    form: "PlaceOrderForm",
    shouldValidate: (params) =>  true // workaround for issue that validations are not triggered when changing orderType in menu.
                                    // minor TODO: check if we can avoid some unnecessary validation call
})(PlaceOrderForm);
