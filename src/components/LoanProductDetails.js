import React from 'react'
import {Table, ListGroupItem} from 'react-bootstrap';
import ToolTip from './ToolTip';
import { Link } from 'react-router-dom'

export default function LoanProductDetails(props) {
    let prod = props.product;
    return(
        <ListGroupItem  header={"Product " + (prod.id +1)  + " - Repay in " + prod.termText} key={prod.id}>
        <Table condensed>
            <tbody>
            <tr>
                <td>
                    Discount rate:
                    <ToolTip title="Discount Rate">
        UCD amount paid / amount to pay back on maturity.<br/>
        Eg. 100 UCD is paid out and discount rate is {prod.discountRate * 100}% then<br/>
        ~{ Math.round( (1 / prod.discountRate) * 10000 ) / 100} UCD must be paid back on maturity.
                    </ToolTip>
                </td>
                <td>{prod.discountRate * 100}%</td>
            </tr>
            <tr>
                <td>Loan coverage ratio:
                    <ToolTip  title="Loan coverage ratio">
        ETH collateral USD value / UCD loan amount. IE. how much UCD loan can you get for your ETH<br/>
        Eg. 1ETH worth 200 USD. Loan coverage ratio is {prod.loanCoverageRatio * 100}%  then you can get
        ~{ Math.round( ( 1 / prod.loanCoverageRatio) * 20000 ) / 100} UCD for 1 ETH.
                    </ToolTip>
                </td>
                <td>{prod.loanCoverageRatio * 100}%</td>
            </tr>
            <tr>
                <td><small>Min disbursed loan amount:</small></td>
                <td><small>{prod.minDisbursedAmountInUcd} UCD</small></td>
            </tr>
            <tr>
                <td><small>Repay period:</small>
                    <ToolTip title="Repay period">
                        How much time you have to repay the UCD loan after maturity.
                        Think of this as a repayment grace period after maturity.
                        After this time period you can't pay it back and your ETH collateral will go to the UCD token reserves.
                    </ToolTip>
                </td>
                <td><small>{prod.repayPeriodText}</small></td>
            </tr>
            </tbody>
        </Table>
        { props.showSelect ? <Link key="prod.id" className="btn btn-primary" to={`/getLoan/${prod.id}`}>Select</Link> : ""}
    </ListGroupItem>
    );
}
