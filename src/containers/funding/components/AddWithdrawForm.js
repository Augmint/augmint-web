import React from "react";
import { connect } from "react-redux";

import { Menu } from "components/augmint-ui/menu";
import Button from "components/augmint-ui/button";
import { Field, reduxForm } from "redux-form";
import { Form, Validations, Normalizations } from "components/BaseComponents";
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
        this.state = { orderDirection: ADDFUND, amount: "" };
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onPriceChange = this.onPriceChange.bind(this);
        this.onTokenAmountChange = this.onTokenAmountChange.bind(this);
    }

    onPriceChange(e) {
        const amount = e.target.value;
        this.setState({
            amount
        });

        if (e.target.attributes["name"].value === WITHDRAW) {
            this.onTokenAmountChange(amount);
        }
    }

    onTokenAmountChange(amount) {
        try {
            const lastChangedAmountField = "tokenAmount";
            this.setState({ lastChangedAmountField });
            this.reCalcAmounts(lastChangedAmountField, this.props.price, amount, null);
        } catch (error) {
            this.props.change("ethAmount", "");
        }
    }

    reCalcAmounts(lastChangedAmountField, _price, _tokenAmount, _ethAmount) {
        const price = this.parsePrice(_price);

        if (lastChangedAmountField === "ethAmount") {
            const ethAmount = parseFloat(_ethAmount);
            if (!isNaN(ethAmount) && isFinite(ethAmount)) {
                const tokenValue = (ethAmount * this.props.rates.info.ethFiatRate) / price;
                this.props.change("tokenAmount", Number(tokenValue.toFixed(DECIMALS)));
            } else {
                //  ethAmount is not entered yet
                this.props.change("tokenAmount", "");
            }
        } else {
            const tokenAmount = parseFloat(_tokenAmount);
            if (!isNaN(tokenAmount) && isFinite(tokenAmount)) {
                const ethValue = (tokenAmount / this.props.rates.info.ethFiatRate) * price;
                this.props.change("ethAmount", Number(ethValue.toFixed(ETH_DECIMALS)));
            } else {
                // tokenAmount is not entered yet
                this.props.change("tokenAmount", "");
            }
        }
    }

    parsePrice(price) {
        return Math.round(price * 100) / 10000;
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

        const linkToGo = orderDirection === ADDFUND ? FUNDS[0].buyUrl : FUNDS[0].sellUrl;

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
                    content={`Go to ${FUNDS[0].name}`}
                    href={linkToGo}
                    target="_blank"
                    labelposition="center"
                    size="large"
                    className="primary"
                    data-testid={orderDirection === ADDFUND ? `${ADDFUND}Link` : `${WITHDRAW}Link`}
                    style={{ width: "100%", padding: "15px 20px" }}
                />
            </Pgrid.Row>
        );

        return (
            <Pblock style={{ margin: 0 }}>
                {header}
                <Form error={error ? "true" : "false"}>
                    <label data-testid={`${orderDirection}Label`}>
                        {orderDirection === ADDFUND ? "Send from bank account ..." : "Send to bank account ..."}
                    </label>

                    <Field
                        name={orderDirection}
                        component={Form.Field}
                        as={Form.Input}
                        type="number"
                        inputmode="numeric"
                        step="any"
                        min="0"
                        onChange={this.onPriceChange}
                        validate={tokenAmountValidations}
                        normalize={Normalizations.fiveDecimals}
                        data-testid={`${orderDirection}Input`}
                        style={{ borderRadius: theme.borderRadius.left }}
                        labelAlignRight={orderDirection === ADDFUND ? "EUR" : "A-EUR"}
                        autoFocus={isDesktop}
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
