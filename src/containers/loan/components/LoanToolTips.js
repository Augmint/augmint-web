import React from "react";
import ToolTip from "components/ToolTip";

export function DiscountRateToolTip(props) {
    return (
        <ToolTip header="Discount Rate">
            Disbursed ACE amount / amount due on maturity.<br />
            E.g. Disbursed loan amount is 100 ACE and discount rate is {props.discountRate * 100}% then<br />
            {Math.round(10000 / props.discountRate) / 100} ACE will be repayable.
        </ToolTip>
    );
}

export function LoanCollateralRatioToolTip(props) {
    return (
        <ToolTip header="Loan/collateral ratio">
            ACE loan amount / EUR value of ETH collateral.<br />
            I.e. How much ACE loan can you get for your ETH<br />
            E.g. 1ETH worth 200 EUR and the Loan Coverage ratio is {props.loanCollateralRatio * 100}% then you can get ~{Math.round(
                props.loanCollateralRatio * 20000
            ) / 100}{" "}
            ACE for 1 ETH placed in escrow.
        </ToolTip>
    );
}

export function DefaultingFeeTooltip(props) {
    return (
        <ToolTip header="Defaulting fee">
            If you don't repay your loan on maturity then the system will calculate the ETH collateral required to cover
            your ACE repayment due. It will use the ETH/ACE rates at moment of the collection executed.<br />
            It will add a percentage of your collateral as fee. The leftover collateral ETH (if any) will be sent back
            to your account.
            <br />
            E.g. 1 ETH worth 200 EUR at the moment of collection and the defaulting fee is 5%.<br />
            You don't repay 200 ACE for a loan with 2 ETH in escrow.<br />
            To cover you missed repayment 1 ETH required. An additional 0.05ETH is required to cover the 5% defaulting
            fee. The collector will send you back 0.95 ETH from your collateral and will take the rest into the Augmint
            reserves.
        </ToolTip>
    );
}
