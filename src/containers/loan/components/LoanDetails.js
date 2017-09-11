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
                <Col>Loan amount:</Col>
                <Col>{loan.ucdDueAtMaturity} UCD</Col>
            </Row>

            <Row>
                <Col>{loan.isDue ? "Pay by:" : "Due on:"}</Col>
                <Col>
                    <span>
                        {loan.isDue ? loan.repayByText : loan.maturityText}
                    </span>
                </Col>
            </Row>

            <Row>
                <Col>Pay by latest:</Col>
                <Col>{loan.repayByText}</Col>
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
                <Col>{loan.disbursedLoanInUcd} UCD</Col>
            </Row>
        </MyGridTable>
    );
}
