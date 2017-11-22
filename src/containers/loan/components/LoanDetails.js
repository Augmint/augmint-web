import React from "react";
import {
    MyGridTable,
    MyGridTableRow as Row,
    MyGridTableColumn as Col
} from "components/MyListGroups";

export default function LoanDetails(props) {
    let loan = props.loan;
    return (
        <MyGridTable>
            <Row>
                <Col>Status: </Col>
                <Col>{loan.loanStateText}</Col>
            </Row>
            <Row>
                <Col>Loan amount:</Col>
                <Col>{loan.ucdDueAtMaturity} ACD</Col>
            </Row>

            <Row>
                <Col>Due on:</Col>
                <Col>{loan.maturityText}</Col>
            </Row>

            <Row>
                <Col>
                    <strong>Pay by latest:</strong>
                </Col>
                <Col>
                    <strong>{loan.repayByText}</strong>
                </Col>
            </Row>

            <Row>
                <Col>Collateral held:</Col>
                <Col>{loan.ethBalance} ETH</Col>
            </Row>

            <Row>
                <Col>Contract:</Col>
                <Col>
                    <small>{loan.loanContract.instance.address}</small>
                </Col>
            </Row>

            <Row>
                <Col>Disbursed on:</Col>
                <Col>{loan.disbursementDateText}</Col>
            </Row>

            <Row>
                <Col>Disbursed amount:</Col>
                <Col>{loan.disbursedLoanInUcd} ACD</Col>
            </Row>
        </MyGridTable>
    );
}
