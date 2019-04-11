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
export const ADDFUND = "addFund";

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
            <div style={{ marginBottom: "2rem" }}>
                <Menu className={"filled"}>
                    <Menu.Item
                        active={orderDirection === ADDFUND}
                        data-index={ADDFUND}
                        onClick={this.onMenuClick}
                        data-testid="addFund"
                        className={"filled"}
                    >
                        Add funds
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === WITHDRAW}
                        data-index={WITHDRAW}
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

                    <Field
                        name="eurToAdd"
                        component={Form.Field}
                        label={orderDirection === ADDFUND ? "Fund from bank account" : "Withdraw to bank account"}
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
                    <Styledlabel style={{ marginTop: "1rem" }}>Available exchange partners:</Styledlabel>

                    <FundList style={{ marginTop: 0 }} user={user} amount={amount} direction={orderDirection} />

                    <p style={{ fontSize: "14px" }}>
                        Interested in becoming an Augmint exchange partner? <Link to="contact">Contact us.</Link>
                    </p>
                </Form>
            </Pblock>
        );
    }
}

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

export default AddWithdrawForm;