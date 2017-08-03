import React from 'react'
import {Table} from 'react-bootstrap';
import { DiscountRateToolTip, LoanCoverageRatioToolTip } from './LoanToolTips';

export default function LoanDetails(props) {
    let loan = props.loan;
    return(
        <Table condensed>
            <thead>
                <tr>
                    <th>
                        {loan.loanStateText} loan #{loan.loanId}
                    </th>
                </tr>
            </thead>
            <tbody>
            <tr>
                <td>Loan amount:</td>
                <td>{loan.ucdDueAtMaturity} UCD</td>
            </tr>

            <tr>
                <td>Due on:</td>
                <td>{loan.maturityText} (latest: {loan.repayByText})</td>
            </tr>

            <tr>
                <td>Collateral:</td>
                <td>{loan.ethBalance} ETH</td>
            </tr>

            <tr>
                <td>Contract:</td>
                <td><small> {loan.loanContract.instance.address}</small></td>
            </tr>

            <tr>
                <td>Disbursed on:</td>
                <td><small>{loan.disbursementDateText}</small></td>
            </tr>

            <tr>
                <td>Disbursed amount:</td>
                <td><small>{loan.disbursedLoanInUcd} UCD</small></td>
            </tr>

            </tbody>
        </Table>
    );
}
