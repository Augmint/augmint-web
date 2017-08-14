import React from "react";
import { Table } from "react-bootstrap";
import { Link } from "react-router-dom";

export default function LoanListDetails(props) {
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
                        <td>
                            {loan.isDue ? "Pay by:" : "Due on:"}
                        </td>
                        <td>
                            <span>
                                {loan.isDue
                                    ? loan.repayByText
                                    : loan.maturityText}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2">
                            <Link
                                key={"selectlink-" + loan.loanId}
                                className="btn btn-link"
                                to={`/loan/${loan.loanId}`}
                            >
                                Details
                            </Link>
                            {loan.isDue &&
                                <Link
                                    key={"repaybtn-" + loan.loanId}
                                    className="btn btn-primary"
                                    to={`/loan/repay/${loan.loanId}`}
                                >
                                    Repay...
                                </Link>}
                        </td>
                    </tr>
                </tbody>
            </Table>
            {props.selectComponent &&
                <props.selectComponent loanId={loan.loanId} />}
        </div>
    );
}
