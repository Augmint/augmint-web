/*
TODO: form client side validation. eg:
    - UCD / ETH balance check
    - number  format check
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import {
    FormGroup,
    InputGroup,
    ControlLabel,
    Button,
    Col,
    Nav,
    NavItem
} from "react-bootstrap";
import store from "modules/store";
import {
    EthSubmissionErrorPanel,
    EthSubmissionSuccessPanel
} from "components/MsgPanels";
import { Field, reduxForm, SubmissionError } from "redux-form";
import { FieldInput, Form } from "components/BaseComponents";
import {
    placeOrder,
    PLACE_ORDER_SUCCESS,
    ETHSELL,
    UCDSELL
} from "modules/reducers/orders";
import BigNumber from "bignumber.js";

const ETH_DECIMALS = 5;
const UCD_DECIMALS = 2;

class PlaceOrderForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { result: null, orderType: ETHSELL };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onOrderTypeChange = this.onOrderTypeChange.bind(this);
        this.onUcdAmountChange = this.onUcdAmountChange.bind(this);
        this.onEthAmountChange = this.onEthAmountChange.bind(this);
    }

    onOrderTypeChange(eventKey) {
        // event.preventDefault();
        this.setState({ orderType: eventKey });
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
            reset
        } = this.props;
        const { isLoading } = this.props.exchange;
        const { orderType } = this.state;

        return (
            <Form horizontal onSubmit={handleSubmit(this.handleSubmit)}>
                <fieldset disabled={submitting || isLoading}>
                    <legend>
                        <Nav
                            bsStyle="tabs"
                            activeKey={orderType}
                            onSelect={this.onOrderTypeChange}
                        >
                            <NavItem eventKey={ETHSELL} title="Buy">
                                <p>Buy</p>
                            </NavItem>
                            <NavItem eventKey={UCDSELL} title="Sell">
                                <p>Sell</p>
                            </NavItem>
                        </Nav>
                    </legend>
                    {isLoading && <p>Connecting to tokenUcd contract...</p>}
                    {error &&
                        <EthSubmissionErrorPanel
                            error={error}
                            collapsible={false}
                            header={<h3>Transfer failed</h3>}
                            onDismiss={() => clearSubmitErrors()}
                        />}

                    {submitSucceeded &&
                        <EthSubmissionSuccessPanel
                            header={<h3>Successful order</h3>}
                            eth={this.state.result.eth}
                            onDismiss={() => reset()}
                        >
                            <p>
                                Order id: {this.state.result.orderId}
                            </p>
                        </EthSubmissionSuccessPanel>}

                    {!submitSucceeded &&
                        <div>
                            <FormGroup controlId="ucdAmount">
                                <Col componentClass={ControlLabel} sm={2}>
                                    {orderType === ETHSELL ? "Buy " : "Sell "}
                                </Col>
                                <Col sm={10}>
                                    <InputGroup>
                                        <Field
                                            name="ucdAmount"
                                            component={FieldInput}
                                            type="number"
                                            onChange={this.onUcdAmountChange}
                                        />
                                        <InputGroup.Addon>UCD</InputGroup.Addon>
                                    </InputGroup>
                                </Col>
                            </FormGroup>

                            <FormGroup controlId="ethAmount">
                                <Col componentClass={ControlLabel} sm={2}>
                                    for{" "}
                                </Col>
                                <Col sm={10}>
                                    <InputGroup>
                                        <Field
                                            name="ethAmount"
                                            component={FieldInput}
                                            type="number"
                                            onChange={this.onEthAmountChange}
                                        />
                                        <InputGroup.Addon>ETH</InputGroup.Addon>
                                    </InputGroup>
                                </Col>
                            </FormGroup>

                            <FormGroup>
                                <Col smOffset={2} sm={10}>
                                    <Button
                                        type="submit"
                                        bsSize="large"
                                        bsStyle="primary"
                                        disabled={pristine}
                                    >
                                        {submitting && "Submitting..."}
                                        {!submitting && orderType === ETHSELL
                                            ? "Place buy UCD order"
                                            : "Place sell UCD order"}
                                    </Button>
                                </Col>
                            </FormGroup>
                        </div>}
                </fieldset>
            </Form>
        );
    }
}

export default reduxForm({
    form: "PlaceOrderForm"
})(PlaceOrderForm);
