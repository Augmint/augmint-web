import React from "react";
import ToolTip from "components/toolTip";
import { ETHEUR } from "utils/constants";

export function LoanInterestRatePaToolTip(props) {
    return (
        <ToolTip header="Loan Interest per Annum" id={"loan_interest_rate"}>
            The annualised interest rate of the loan. It's calculated using a simple (non-compound) method and with a
            365 day year.
            <br />
            Note: For small loan amounts the actual interest percent can slightly differ than displayed (~0.01 A-EUR
            difference in interest amount due to rounding )
        </ToolTip>
    );
}

export function DiscountRateToolTip(props) {
    // not shown on UI anymore, kept for future reference
    return (
        <ToolTip header="Discount Rate" id={"discount_rate"}>
            Disbursed A-EUR amount / amount due on maturity.
            <br />
            E.g. Disbursed loan amount is 100 A-EUR and discount rate is {props.discountRate * 100}% then
            <br />
            {Math.round(10000 / props.discountRate) / 100} A-EUR will be repayable.
        </ToolTip>
    );
}

export function LoanCollateralRatioToolTip(props) {
    return (
        <ToolTip header="Loan/collateral ratio" id={"loan_collateral_ratio"}>
            A-EUR loan amount / EUR value of ETH collateral.
            <br />
            I.e. How much A-EUR loan can you get for your ETH
            <br />
            E.g. 1ETH worth 200 EUR and the Loan/Collateral ratio is {props.collateralRatio}% then you can get ~
            {Math.round(props.loanCollateralRatio * 20000) / 100} A-EUR for 1 ETH placed in escrow.
        </ToolTip>
    );
}

export function DefaultingFeeTooltip(props) {
    return (
        <ToolTip header="Defaulting fee" id={"defaulting_fee"}>
            If you don't repay your loan on maturity then the system will calculate the ETH collateral required to cover
            your A-EUR repayment due. It will use the {ETHEUR} rates at moment of the collection executed.
            <br />
            It will add a percentage of your repayment amount as fee. The leftover collateral ETH (if any) will be sent
            back to your account.
            <br />
            <small>
                E.g. 1 ETH worth 200 EUR at the moment of collection and the defaulting fee is 5%.
                <br />
                You don't repay 200 A-EUR with 2 ETH in escrow.
                <br />
                To cover you missed repayment 1 ETH + 0.05ETH (5% of 200 A-EUR) is required.
                <br />
                The collector will send you back 0.95 ETH and will take 1.05 ETH into the Augmint reserves.
            </small>
        </ToolTip>
    );
}
