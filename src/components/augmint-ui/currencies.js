import React from "react";
import styled from "styled-components";
import { DECIMALS } from "utils/constants";
import utils from "web3";

const NoWrap = styled.span`
    white-space: nowrap;
`;

function signum(n) {
    /*eslint eqeqeq: 0*/
    return n == 0 ? "zero" : n > 0 ? "positive" : "negative";
    /*eslint eqeqeq: 1*/
}

/*
    amount: amount to display (an integer in the smallest unit of account)
    raw: set to true, if amount is a floating point num (the number will be printed without unit conversion)
 */
export class AEUR extends React.Component {
    render() {
        const { amount, raw, className, ...rest } = this.props;
        const amt = raw ? amount : amount / Math.pow(10, DECIMALS);
        const cls = ["AEUR", className, signum(amt)].join(" ");
        return (
            <NoWrap className={cls} {...rest}>
                {amt.toFixed(DECIMALS)} A€
            </NoWrap>
        );
    }
}

/*
    amount: amount to display (an integer in the smallest unit of account, Wei)
    raw: set to true, if amount is a floating point num (the number will be printed without unit conversion)
    decimals: default to 5
 */
export class ETH extends React.Component {
    render() {
        const { amount, raw, className, decimals = 5, ...rest } = this.props;
        const amt = raw ? amount : utils.fromWei(amount);
        const cls = ["ETH", className, signum(amt)].join(" ");
        return (
            <NoWrap className={cls} {...rest}>
                {amt.toFixed(decimals)} ETH
            </NoWrap>
        );
    }
}
