/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Menu } from "components/augmint-ui/menu";
import Button from "components/augmint-ui/button";
import { ConnectionStatus, EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Field, formValueSelector, reduxForm } from "redux-form";
import { Form, Normalizations, Validations } from "components/BaseComponents";
import { PLACE_ORDER_SUCCESS, placeOrder, TOKEN_BUY, TOKEN_SELL } from "modules/reducers/orders";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import BigNumber from "bignumber.js";

import { matchOrders } from "../simplebuy";

import theme from "styles/theme";
import styled from "styled-components";
import { Pgrid } from "../../../components/PageLayout";

const Styledlabel = styled.label`
    display: inline-block;
    margin-bottom: 5px;
`;

class SimpleBuyForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            result: null,
            orderDirection: TOKEN_BUY,
            orders: [],
            orderlist: []
        };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onOrderDirectionChange = this.onOrderDirectionChange.bind(this);
        // this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
        // this.onEthAmountChange = this.onEthAmountChange.bind(this);
        // this.onPriceChange = this.onPriceChange.bind(this);
    }

    onOrderDirectionChange(e) {
        const orderDirection = +e.target.attributes["data-index"].value;

        const orders =
            orderDirection === TOKEN_BUY ? this.props.orders.orders.sellOrders : this.props.orders.orders.buyOrders;
        this.setState({
            orderDirection,
            orders,
            orderlist: []
        });

        console.debug(orders, orderDirection, TOKEN_BUY, this.state.orderDirection, "state orders");
    }

    calcMatchResults(token) {
        const initOrders =
            this.state.orderDirection === TOKEN_BUY
                ? this.props.orders.orders.sellOrders
                : this.props.orders.orders.buyOrders;
        const orders = this.state.orders.length ? this.state.orders : initOrders;
        const { ethFiatRate } = this.props.rates.info;
        const bn_ethFiatRate = ethFiatRate !== null && new BigNumber(ethFiatRate);

        if (this.state.orderlist.length) {
            return matchOrders(token, this.state.orderlist);
        } else {
            const orderlist = orders.map(order => {
                if (this.state.orderDirection === TOKEN_BUY) {
                    order.ethers = (order.amount * order.price) / bn_ethFiatRate;
                } else {
                    order.ethers = order.amount;
                    order.amount = (bn_ethFiatRate / order.price) * order.ethers;
                }

                return order;
            });
            this.setState({ orderlist });

            console.debug(matchOrders(token, orderlist, this.state.orderDirection));
            return matchOrders(token, orderlist, this.state.orderDirection);
        }
    }

    handleSubmit(values) {
        const { simpleTokenAmount } = values;
        const result = this.calcMatchResults(simpleTokenAmount);

        console.log(result);

        this.setState({
            result
        });
    }

    // async handleSubmit(values) {
    //     let amount, price;
    //     const orderDirection = this.state.orderDirection;
    //
    //     try {
    //         price = this.parsePrice(values.price);
    //         if (orderDirection === TOKEN_BUY) {
    //             amount = parseFloat(values.ethAmount);
    //         } else {
    //             amount = parseFloat(values.tokenAmount);
    //         }
    //     } catch (error) {
    //         throw new SubmissionError({
    //             _error: {
    //                 title: "Invalid amount",
    //                 details: error
    //             }
    //         });
    //     }
    //
    //     const res = await store.dispatch(placeOrder(orderDirection, amount, price));
    //
    //     if (res.type !== PLACE_ORDER_SUCCESS) {
    //         throw new SubmissionError({
    //             _error: res.error
    //         });
    //     } else {
    //         this.setState({
    //             result: res.result
    //         });
    //         return;
    //     }
    // }
    //
    // parsePrice(price) {
    //     return Math.round(price * 100) / 10000;
    // }

    render() {
        const {
            header: mainHeader,
            error,
            handleSubmit,
            // pristine,
            submitting,
            submitSucceeded,
            clearSubmitErrors,
            reset
        } = this.props;
        const { orderDirection, result } = this.state;
        //
        // const ethAmountValidations = [Validations.required, Validations.ethAmount];
        // if (orderDirection === TOKEN_BUY) {
        //     ethAmountValidations.push(Validations.ethUserBalance);
        // }
        //
        // const tokenAmountValidations = [Validations.required, Validations.tokenAmount, Validations.minOrderTokenAmount];
        // if (orderDirection === TOKEN_SELL) {
        //     tokenAmountValidations.push(Validations.userTokenBalance);
        // }

        const header = (
            <div>
                {mainHeader}
                <Menu style={{ marginBottom: -11 }}>
                    <Menu.Item
                        active={orderDirection === TOKEN_BUY}
                        data-index={TOKEN_BUY}
                        onClick={this.onOrderDirectionChange}
                        data-testid="simpleBuyMenuLink"
                        className={"buySell"}
                    >
                        Buy A-EUR
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === TOKEN_SELL}
                        data-index={TOKEN_SELL}
                        onClick={this.onOrderDirectionChange}
                        data-testid="simpleSellMenuLink"
                        className={"buySell"}
                    >
                        Sell A-EUR
                    </Menu.Item>
                </Menu>
            </div>
        );

        return (
            <Pblock header={header}>
                {/*<ConnectionStatus contract={this.props.exchange} />*/}

                {/*{submitSucceeded && (*/}
                {/*<EthSubmissionSuccessPanel*/}
                {/*header="Order submitted"*/}
                {/*result={this.state.result}*/}
                {/*onDismiss={() => reset()}*/}
                {/*data-test-orderid={this.state.result.orderId}*/}
                {/*/>*/}
                {/*)}*/}

                {
                    <Form error={error ? "true" : "false"} onSubmit={handleSubmit(this.handleSubmit)}>
                        {/*<EthSubmissionErrorPanel*/}
                        {/*error={error}*/}
                        {/*header="Place Order failed"*/}
                        {/*onDismiss={() => clearSubmitErrors()}*/}
                        {/*/>*/}

                        <Styledlabel>
                            <strong>
                                {orderDirection === TOKEN_BUY ? "A-EUR amount to buy" : "A-EUR amount to sell"}
                            </strong>
                            {orderDirection === TOKEN_BUY && <span> (calculated on current rate)</span>}
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
                            // onChange={this.onTokenAmountChange}
                            // validate={tokenAmountValidations}
                            normalize={Normalizations.twoDecimals}
                            data-testid="simpleTokenAmountInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="A-EUR"
                        />

                        <Button
                            size="big"
                            loading={submitting}
                            // disabled={pristine}
                            data-testid="simpleSubmitButton"
                            type="submit"
                        >
                            {submitting && "Submitting..."}
                            {!submitting &&
                                (orderDirection === TOKEN_BUY ? "Submit buy A-EUR order" : "Submit sell A-EUR order")}
                        </Button>
                    </Form>
                }
                <Pgrid>
                    {submitSucceeded && (
                        <div>
                            <p>
                                you could {orderDirection === TOKEN_BUY ? "buy" : "sell"} {result.tokens} a-eur
                            </p>
                            <p>for {result.ethers} ethers</p>
                            <p>with a limitPrice of {result.limitPrice * 100}%</p>
                            <p>on average {result.averagePrice * 100}%</p>
                        </div>
                    )}
                </Pgrid>
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
