import React from "react";
import styled from "styled-components";
import utils from "web3";

const NoWrap = styled.span`
    white-space: nowrap;
`;

/*
    amount: amount to display (an integer in the smallest unit of account, Wei)
    raw: set to true, if amount is a floating point num (the number will be printed without unit conversion)
    decimals: default to 5
 */
export class ETH extends React.Component {
    render() {
        const { amount, raw, className, decimals = 5 } = this.props;
        const amt = raw ? amount : utils.fromWei(amount);
        const sign = amt === 0 ? "zero" : amt > 0 ? "positive" : "negative";
        const cls = ["ETH", className, sign].join(" ");
        return <NoWrap className={cls}>{amt.toFixed(decimals)} ETH</NoWrap>;
    }
}
