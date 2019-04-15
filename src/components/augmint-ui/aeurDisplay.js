import React from "react";
import styled from "styled-components";
import { DECIMALS } from "utils/constants";

const NoWrap = styled.span`
    white-space: nowrap;
`;

/*
    amount: amount to display (an integer in the smallest unit of account)
    raw: set to true, if amount is a floating point num (the number will be printed without unit conversion)
 */
export class AEUR extends React.Component {
    render() {
        const { amount, raw, className } = this.props;
        const amt = raw ? amount : amount / Math.pow(10, DECIMALS);
        const sign = amt === 0 ? "zero" : amt > 0 ? "positive" : "negative";
        const cls = ["AEUR", className, sign].join(" ");
        return <NoWrap className={cls}>{amt.toFixed(DECIMALS)} A€</NoWrap>;
    }
}
