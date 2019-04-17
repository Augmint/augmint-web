import React from "react";
import styled from "styled-components";
import { DECIMALS } from "utils/constants";

const NoWrap = styled.span`
    white-space: nowrap;
`;

function isEmpty(n) {
    return n === undefined || n === null;
}

function signum(n) {
    /*eslint eqeqeq: 0*/
    return isEmpty(n) ? "empty" : n == 0 ? "zero" : n > 0 ? "positive" : "negative";
    /*eslint eqeqeq: 1*/
}

function format(n, decimals) {
    const fmt = new Intl.NumberFormat("en", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
    return fmt.format(n);
}

/*
    amount: amount to display
    raw: set to true, if amount is an integer in the smallest unit of account
    decimals: default to token decimals
 */
export class AEUR extends React.Component {
    render() {
        const { amount, raw, className, decimals = DECIMALS, ...rest } = this.props;
        const amt = amount === undefined || (raw ? amount / Math.pow(10, DECIMALS) : amount);
        const cls = ["AEUR", className, signum(amt)].join(" ");
        return (
            <NoWrap className={cls} {...rest}>
                {!isEmpty(amt) && `${format(amt, decimals)} A€`}
            </NoWrap>
        );
    }
}

/*
    amount: amount to display
    raw: set to true, if amount is an integer in the smallest unit of account (wei)
    decimals: default to 5
 */
export class ETH extends React.Component {
    render() {
        const { amount, raw, className, decimals = 4, ...rest } = this.props;
        const amt = amount === undefined || (raw ? amount / Math.pow(10, 18) : amount);
        const cls = ["ETH", className, signum(amt)].join(" ");
        return (
            <NoWrap className={cls} {...rest}>
                {!isEmpty(amt) && `${format(amt, decimals)} ETH`}
            </NoWrap>
        );
    }
}
