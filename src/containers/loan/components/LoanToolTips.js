import React from "react";
import ToolTip from "components/ToolTip";

export function DiscountRateToolTip(props) {
    return (
        <ToolTip header="Discount Rate">
            Disbursed ACD amount / amount due on maturity.<br />
            E.g. Loan amount is 100 ACD and discount rate is {props.discountRate * 100}% then<br />
            {Math.round(props.discountRate * 10000) / 100} ACD will be disbursed.
        </ToolTip>
    );
}

export function LoanCollateralRatioToolTip(props) {
    return (
        <ToolTip header="Loan/collateral ratio">
            ACD loan amount / USD value of ETH collateral.<br />
            I.e. How much ACD loan can you get for your ETH<br />
            E.g. 1ETH worth 200 USD and the Loan Coverage ratio is {props.loanCollateralRatio * 100}% then you can get ~{Math.round(
                props.loanCollateralRatio * 20000
            ) / 100}{" "}
            ACD for 1 ETH placed in escrow.
        </ToolTip>
    );
}
