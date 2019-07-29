import React from "react";
import Button from "components/augmint-ui/button";

export function LoanRepayLink(props) {
    const {
        to = `/loan/repay/${props.loan.id}/${props.loan.loanManagerAddress}`,
        key = `repaybtn-${props.loan.id}_${props.loan.loanManagerAddress}`,
        className = props.loan.isDue ? "repayButton" : "repayEarlyButton",
        content = props.loan.isDue ? "Repay" : "Repay Early",
        icon = "right chevron",
        labelPosition = "right",
        loan,
        ...other
    } = props;
    return loan.isRepayable ? (
        <Button
            className={className}
            key={key}
            to={to}
            data-testid="repayLoanButton"
            icon={icon}
            labelposition={labelPosition}
            content={content}
            {...other}
        />
    ) : null;
}
