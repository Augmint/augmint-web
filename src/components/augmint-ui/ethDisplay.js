import React from "react";
import styled from "styled-components";

const StyledSpan = styled.span`
    white-space: nowrap;
`;

/*
    amount: amount to display (an integer in the smallest unit of account ==> WEI)
    raw: set to true, if amount is a floating point num (the number will be printed without unit conversion)
    decimals: default to 5
 */
export class ETH extends React.Component {
    render() {
        const { amount, raw, className, decimals = 5 } = this.props;
        let txAmount = amount;
        if (!raw) {
            txAmount = txAmount / Math.pow(10, decimals);
        }
        const _className = txAmount === 0 ? "zero" : txAmount > 0 ? "positive" : "negative";
        if (txAmount.toFixed) {
            return <StyledSpan className={className + " " + _className}>{txAmount.toFixed(decimals)} ETH</StyledSpan>;
        } else {
            console.log(txAmount, typeof txAmount);
            return txAmount;
        }
    }
}
