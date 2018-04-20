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
                <Col>{loan.repaymentAmount} A-EUR</Col>
            </Row>

            <Row>
                <Col>Due on:</Col>
                <Col>{loan.maturityText}</Col>
            </Row>

            <Row>
                <Col>Collateral:</Col>
                <Col>
                    {loan.collateralEth} ETH ({loan.collateralStatus})
                </Col>
            </Row>

            <Row>
                <Col>Loan id:</Col>
                <Col>
                    <small>{loan.id}</small>
                </Col>
            </Row>

            <Row>
                <Col>Disbursed on:</Col>
                <Col>{loan.disbursementTimeText}</Col>
            </Row>

            <Row>
                <Col>Loan amount (disbursed):</Col>
                <Col>{loan.loanAmount} A-EUR</Col>
            </Row>
        </MyGridTable>
    );
}
