import React from "react";
import { Table } from "react-bootstrap";

export default function LoanDetails(props) {
    let loan = props.loan;
    return (
        <div>
            <Table condensed>
                <thead>
                    <tr>
                        <th colSpan="2">
                            {loan.loanStateText} loan #{loan.loanId}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Loan amount:</td>
                        <td>
                            {loan.ucdDueAtMaturity} UCD
                        </td>
                    </tr>

                    <tr>
                        <td>Due on:</td>
                        <td>
                            {loan.maturityText}
                        </td>
                    </tr>

                    <tr>
                        <td>Pay by latest:</td>
                        <td>
                            {loan.repayByText}
                        </td>
                    </tr>

                    <tr>
                        <td>Collateral held:</td>
                        <td>
                            {loan.ethBalance} ETH
                        </td>
                    </tr>

                    <tr>
                        <td>Contract:</td>
                        <td>
                            <small>
                                {loan.loanContract.instance.address}
                            </small>
                        </td>
                    </tr>

                    <tr>
                        <td>Disbursed on:</td>
                        <td>
                            {loan.disbursementDateText}
                        </td>
                    </tr>

                    <tr>
                        <td>Disbursed amount:</td>
                        <td>
                            {loan.disbursedLoanInUcd} UCD
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
}
