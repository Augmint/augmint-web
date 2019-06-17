import React from "react";
import { connect } from "react-redux";

import { Menu } from "components/augmint-ui/menu";
import Button from "components/augmint-ui/button";
import { Field, reduxForm } from "redux-form";
import { Form, Validations, Normalizations, Parsers } from "components/BaseComponents";
import { Pblock, Pgrid } from "components/PageLayout";
import FundList from "./FundList/index";
import { DECIMALS, ETH_DECIMALS } from "utils/constants";

import theme from "styles/theme";

import { FUNDS } from "./FundList/funds.js";

export const WITHDRAW = "withdraw";
export const ADDFUND = "addFunds";

class AddWithdrawForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { orderDirection: ADDFUND, amount: "", address: "" };
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        // this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    onInputChange(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    onMenuClick(e) {
        if (e.target.attributes["data-index"].value === ADDFUND) {
            this.setState({
                orderDirection: ADDFUND
            });
        } else {
            this.setState({
                orderDirection: WITHDRAW
            });
        }
    }

    onSubmit(e) {
        e.preventDefault();
        const { amount, address } = this.state;
        let fetchUrl = "";
        let data = { "sending-amount": amount };
        console.log(amount, address, this.state);

        if (this.state.orderDirection === ADDFUND) {
            fetchUrl = FUNDS[0].buyUrl;
            data["to-address"] = address;
        } else {
            fetchUrl = FUNDS[0].sellUrl;
            data["from-address"] = address;
        }

        window.fetch(fetchUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: data
        });
    }

    render() {
        const { error, user } = this.props;
        const { orderDirection, amount } = this.state;

        const tokenAmountValidations = [
            Validations.required,
            Validations.tokenAmount,
            Validations.minMrCoinTokenAmount
        ];
        if (orderDirection === WITHDRAW) {
            tokenAmountValidations.push(Validations.userTokenBalance);
        }

        const isDesktop = window.innerWidth > 768;

        const linkToGo =
            orderDirection === ADDFUND
                ? `${FUNDS[0].buyUrl}?to-address=${user.address}&sending-amount=${amount}`
                : `${FUNDS[0].sellUrl}?from-address=${user.address}&sending-amount=${amount}`;

        const header = (
            <div style={{ marginBottom: "2rem" }}>
                <Menu className={"filled"}>
                    <Menu.Item
                        active={orderDirection === ADDFUND}
                        data-index={`${ADDFUND}`}
                        onClick={this.onMenuClick}
                        data-testid={`${ADDFUND}Tab`}
                        className={"filled"}
                        tabIndex="0"
                    >
                        Buy A-EUR
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === WITHDRAW}
                        data-index={`${WITHDRAW}`}
                        onClick={this.onMenuClick}
                        data-testid={`${WITHDRAW}Tab`}
                        className={"filled"}
                        tabIndex="0"
                    >
                        Sell A-EUR
                    </Menu.Item>
                </Menu>
            </div>
        );

        const buttonToGo = (
            <Pgrid.Row>
                <Button
                    // href={linkToGo}
                    // target="_blank"
                    type="submit"
                    labelposition="center"
                    size="large"
                    className="primary"
                    data-testid={orderDirection === ADDFUND ? `${ADDFUND}Link` : `${WITHDRAW}Link`}
                    style={{ width: "100%", padding: "15px 20px" }}
                    // loading={submitting}
                >
                    {/*{submitting ? "Submitting..." : submitText || "Send"}*/}
                    Send
                </Button>
            </Pgrid.Row>
        );

        return (
            <Pblock style={{ margin: 0 }}>
                {header}
                <Form error={error ? "true" : "false"} onSubmit={this.onSubmit}>
                    <label data-testid={`${orderDirection}AmountLabel`}>
                        {orderDirection === ADDFUND ? "Send from bank account ..." : "Send to bank account ..."}
                    </label>

                    <Field
                        name={"amount"}
                        component={Form.Field}
                        as={Form.Input}
                        type="number"
                        inputmode="numeric"
                        step="any"
                        min="0"
                        onChange={this.onInputChange}
                        validate={tokenAmountValidations}
                        normalize={Normalizations.fiveDecimals}
                        data-testid={`${orderDirection}AmountInput`}
                        style={{ borderRadius: theme.borderRadius.left }}
                        labelAlignRight={orderDirection === ADDFUND ? "EUR" : "A-EUR"}
                        autoFocus={isDesktop}
                    />

                    <label data-testid={`${orderDirection}AddressLabel`}>
                        {orderDirection === ADDFUND ? "To address" : "From address"}
                    </label>

                    <Field
                        name={"address"}
                        component={Form.Field}
                        as={Form.Input}
                        type="text"
                        inputmode="text"
                        size="small"
                        parse={Parsers.trim}
                        placeholder="0x0..."
                        data-testid={`${orderDirection}AddressInput`}
                        onChange={this.onInputChange}
                        // style={{ borderRadius: theme.borderRadius.left }}
                    />

                    <label>Available exchange partner:</label>

                    <FundList user={user} amount={amount} direction={orderDirection} />

                    {buttonToGo}

                    <p style={{ fontSize: "14px" }}>
                        Interested in becoming an Augmint exchange partner?{" "}
                        <a href="mailto:hello@augmint.org">Contact us.</a>
                    </p>
                </Form>
            </Pblock>
        );
    }
}

AddWithdrawForm = reduxForm({
    form: "AddWithdrawForm",
    touchOnChange: true,
    touchOnBlur: false,
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
})(AddWithdrawForm);

function mapStateToProps(state, ownProps) {
    return { initialValues: { price: 100 } };
}

AddWithdrawForm = connect(mapStateToProps)(AddWithdrawForm);

export default AddWithdrawForm;
