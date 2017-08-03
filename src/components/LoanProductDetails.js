import React from 'react'
import {Table, ListGroupItem} from 'react-bootstrap';
import { DiscountRateToolTip, LoanCoverageRatioToolTip, RepayPeriodToolTip } from './LoanToolTips';

export default function LoanProductDetails(props) {
    let prod = props.product;
    return(
        <ListGroupItem  header={"Product " + (prod.id +1)  + " - Repay in " + prod.termText} key={prod.id}>
        <Table condensed>
            <tbody>
            <tr>
                <td>
                    Discount rate: <DiscountRateToolTip discountRate={prod.discountRate} />
                </td>
                <td>{prod.discountRate * 100}%</td>
            </tr>
            <tr>
                <td>Loan coverage ratio: <LoanCoverageRatioToolTip loanCoverageRatio={prod.loanCoverageRatio} />
                </td>
                <td>{prod.loanCoverageRatio * 100}%</td>
            </tr>
            <tr>
                <td><small>Min disbursed loan amount:</small></td>
                <td><small>{prod.minDisbursedAmountInUcd} UCD</small></td>
            </tr>
            <tr>
                <td><small>Repay period: <RepayPeriodToolTip/></small>
                </td>
                <td><small>{prod.repayPeriodText}</small></td>
            </tr>
            </tbody>
        </Table>
        { props.selectComponent }
    </ListGroupItem>
    );
}
