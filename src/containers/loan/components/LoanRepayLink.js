import React from "react";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";

export function LoanRepayLink(props) {
    const {
        as = Link,
        to = "/loan/repay/" + props.loan.id,
        key = "repaybtn-" + props.loan.id,
        className = props.loan.isDue ? "repayButton" : "repayEarlyButton",
        content = props.loan.isDue ? "Repay" : "Repay Early",
        icon = "right chevron",
        labelPosition = "right",
        primary = props.loan.isDue,
        basic = !props.loan.isDue,
        loan,
        ...other
    } = props;
    return loan.isRepayable ? (
        <Button
            as={as}
            className={className}
            key={key}
            to={to}
            data-testid="repayLoanButton"
            icon={icon}
            labelPosition={labelPosition}
            content={content}
            primary={primary}
            basic={basic}
            {...other}
        />
    ) : null;
}
