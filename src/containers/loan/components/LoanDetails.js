import React from "react";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";

export default function LoanDetails(props) {
    const loan = props.loan;
    return (
        <MyGridTable>
            <Row>
                <Col>Status: </Col>
                <Col>{loan.loanStateText}</Col>
            </Row>
            <Row>
                <Col>Repayment amount:</Col>
                <Col>{loan.repaymentAmount} ACD</Col>
            </Row>

            <Row>
                <Col>Due on:</Col>
                <Col>{loan.maturityText}</Col>
            </Row>

            <Row>
                <Col>Collateral held:</Col>
                <Col>{loan.collateralEth} ETH</Col>
            </Row>

            <Row>
                <Col>Loan id:</Col>
                <Col>
                    <small>{loan.loanId}</small>
                </Col>
            </Row>

            <Row>
                <Col>Disbursed on:</Col>
                <Col>{loan.disbursementDateText}</Col>
            </Row>

            <Row>
                <Col>Loan amount (disbursed):</Col>
                <Col>{loan.loanAmount} ACD</Col>
            </Row>
        </MyGridTable>
    );
}
