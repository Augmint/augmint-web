/*
TODO: input formatting: decimals, thousand separators
  */

import React from "react";
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
        console.log(this.state.amount);
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

        const { orderDirection } = this.state;

        const header = (
            <div style={{ paddingTop: "10px" }}>
                <Menu className={"withdraw"}>
                    <Menu.Item
                        active={orderDirection === ADDFUND}
                        data-index={ADDFUND}
                        onClick={this.onMenuClick}
                        data-testid="addFund"
                        className={"withdraw"}
                    >
                        Add Fund
                    </Menu.Item>
                    <Menu.Item
                        active={orderDirection === WITHDRAW}
                        data-index={WITHDRAW}
                        onClick={this.onMenuClick}
                        data-testid="withdrawFund"
                        className={"withdraw"}
                    >
                        Withdraw
                    </Menu.Item>
                </Menu>
            </div>
        );

        return (
            <Pblock>
                <ConnectionStatus contract={this.props.exchange} />
                {header}

                {
                    <Form error={error ? "true" : "false"}>
                        <EthSubmissionErrorPanel error={error} />

                        <Styledlabel>
                            {orderDirection === ADDFUND ? "Fund from bank account" : "Withdraw from fund"}
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
                            data-testid="eurToAddInput"
                            style={{ borderRadius: theme.borderRadius.left }}
                            labelAlignRight="EUR"
                        />
                        <Styledlabel>Available exchange partners:</Styledlabel>

                        <FundList user={user} order={orderDirection} />
                    </Form>
                }
            </Pblock>
        );
    }
}

const selector = formValueSelector("PlaceOrderForm");
AddWithdrawForm = connect(state => {
    const { ethAmount, tokenAmount, price } = selector(state, "ethAmount", "tokenAmount", "price");
    return { ethAmount, tokenAmount, price }; // to get amounts for orderHelpText in render
})(AddWithdrawForm);

AddWithdrawForm = reduxForm({
    form: "PlaceOrderForm",
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
