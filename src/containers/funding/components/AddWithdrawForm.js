/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "components/augmint-ui/menu";
import { ConnectionStatus, EthSubmissionErrorPanel, EthSubmissionSuccessPanel } from "components/MsgPanels";
import { Field, formValueSelector, reduxForm } from "redux-form";
import { Form, Normalizations, Validations } from "components/BaseComponents";
import { connect } from "react-redux";
import { Pblock } from "components/PageLayout";
import FundList from "./FundList/index";

import theme from "styles/theme";
import styled from "styled-components";

export const WITHDRAW = "withdraw";
export const ADDFUND = "addFunds";

const Styledlabel = styled.label`
    display: inline-block;
    margin-bottom: 5px;
`;

class AddWithdrawForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = { orderDirection: ADDFUND, amount: "" };
        this.onMenuClick = this.onMenuClick.bind(this);
        this.onPriceChange = this.onPriceChange.bind(this);
    }

    onPriceChange(e) {
        this.setState({
            amount: e.target.value
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

    render() {
        const { error, user } = this.props;

        const { orderDirection, amount } = this.state;

        const header = (
            <div style={{ paddingTop: "10px" }}>
                <Menu className={"filled"}>
                    <Menu.Item
                        active={orderDirection === ADDFUND}
                        data-index={`${ADDFUND}-tab`}
                        onClick={this.onMenuClick}
                        data-testid="addFund"
                        className={"filled"}
                    >
                        Add funds
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === WITHDRAW}
                        data-index={`${WITHDRAW}-tab`}
                        onClick={this.onMenuClick}
                        data-testid="withdrawFund"
                        className={"filled"}
                    >
                        Withdraw
                    </Menu.Item>
                </Menu>
            </div>
        );

        return (
            <Pblock>
                {header}
                <Form error={error ? "true" : "false"}>
                    <EthSubmissionErrorPanel error={error} />

                    <Styledlabel data-testid={`%{orderDirection}Label`}>
                        {orderDirection === ADDFUND ? "Fund from bank account" : "Withdraw to bank account"}
                    </Styledlabel>

                    <Field
                        name="eurToAdd"
                        component={Form.Field}
                        as={Form.Input}
                        type="number"
                        inputmode="numeric"
                        step="any"
                        min="0"
                        onChange={this.onPriceChange}
                        normalize={Normalizations.fiveDecimals}
                        data-testid="fundingInput"
                        style={{ borderRadius: theme.borderRadius.left }}
                        labelAlignRight={orderDirection === ADDFUND ? "EUR" : "A-EUR"}
                    />
                    <Styledlabel>Available exchange partners:</Styledlabel>

                    <FundList user={user} amount={amount} direction={orderDirection} />

                    <p style={{ fontSize: "14px" }}>
                        Interested in becoming an Augmint exchange partner? <Link to="contact">Contact us.</Link>
                    </p>
                </Form>
            </Pblock>
        );
    }
}

const selector = formValueSelector("AddWithdrawForm");
AddWithdrawForm = connect(state => {
    const { ethAmount, tokenAmount, price } = selector(state, "ethAmount", "tokenAmount", "price");
    return { ethAmount, tokenAmount, price }; // to get amounts for orderHelpText in render
})(AddWithdrawForm);

AddWithdrawForm = reduxForm({
    form: "AddWithdrawForm",
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
