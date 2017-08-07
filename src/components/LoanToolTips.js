import React from 'react'
//import {Popover, Glyphicon, OverlayTrigger} from 'react-bootstrap';
import ToolTip from './ToolTip';

export function DiscountRateToolTip(props) {
    return (
        <ToolTip title="Discount Rate">
            Disbursed UCD amount / amount due on maturity.<br/>
        E.g. Loan amount is 100 UCD and discount rate is {props.discountRate * 100}% then<br/>
    { Math.round( (props.discountRate) * 10000 ) / 100} UCD will be disbursed.
        </ToolTip>
    )
};

export function LoanCollateralRatioToolTip(props) {
    return (
        <ToolTip  title="Loan/collateral ratio">
            UCD loan amount / USD value of ETH collateral.<br/>
            I.e. How much UCD loan can you get for your ETH<br/>
        E.g. 1ETH worth 200 USD and the Loan Coverage ratio is {props.loanCollateralRatio * 100}% then you can get
            ~{ Math.round( ( props.loanCollateralRatio) * 20000 ) / 100} UCD for 1 ETH placed in escrow.
        </ToolTip>
    )
};

export function RepayPeriodToolTip(props) {
    return (
        <ToolTip title="Repayment period">
            How much time you have to repay the UCD loan after maturity.
            Think of this as a repayment grace period after maturity.
            After this time period you can't pay it back and it's considered unpayed (defaulted).
        </ToolTip>
    )
};
