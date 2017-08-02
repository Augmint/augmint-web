import React from 'react'
//import {Popover, Glyphicon, OverlayTrigger} from 'react-bootstrap';
import ToolTip from './ToolTip';

export function DiscountRateToolTip(props) {
    return (
        <ToolTip title="Discount Rate">
            UCD amount paid / amount to pay back on maturity.<br/>
            Eg. 100 UCD is paid out and discount rate is {props.discountRate * 100}% then<br/>
            ~{ Math.round( (1 / props.discountRate) * 10000 ) / 100} UCD must be paid back on maturity.
        </ToolTip>
    )
};

export function LoanCoverageRatioToolTip(props) {
    return (
        <ToolTip  title="Loan coverage ratio">
            ETH collateral USD value / UCD loan amount. Ie. How much UCD loan can you get for your ETH<br/>
            Eg. 1ETH worth 200 USD. Loan coverage ratio is {props.loanCoverageRatio * 100}%  then you can get
            ~{ Math.round( ( props.loanCoverageRatio) * 20000 ) / 100} UCD for 1 ETH.
        </ToolTip>
    )
};

export function RepayPeriodToolTip(props) {
    return (
        <ToolTip title="Repay period">
            How much time you have to repay the UCD loan after maturity.
            Think of this as a repayment grace period after maturity.
            After this time period you can't pay it back and your ETH collateral will go to the UCD token reserves.
        </ToolTip>
    )
};
