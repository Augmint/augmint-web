import React from "react";
import styled from "styled-components";
import { DECIMALS } from "utils/constants";

const styledSpan = styled.span`
    white-space: nowrap;
`;

/*
    amount: amount to display
    showPlusSign: set to true, if you want to display plus sign before positive numbers
    divide: set to true, if the amount is in AEUR cents
 */
export class AEur extends React.Component {
    render() {
        const { amount, showPlusSign, divide } = this.props;
        let txAmount = amount;
        if (divide) {
            txAmount = txAmount / Math.pow(10, DECIMALS);
        }
        let text = `${txAmount.toFixed(DECIMALS)} A€`;
        if (showPlusSign) {
            text = txAmount > 0 ? `+${text}` : text;
        }
        return <styledSpan>{text}</styledSpan>;
    }
}
