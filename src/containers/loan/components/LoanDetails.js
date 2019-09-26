import React from "react";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import { AEUR, ETH } from "components/augmint-ui/currencies";
import moment from "moment";

export default function LoanDetails(props) {
    const loan = props.loan;
    return (
        <MyGridTable>
            <Row>
                <Col>Status: </Col>
                <Col>
                    {loan.isRepaid ? "Repaid" : loan.isCollected ? "Collected" : loan.isExpired ? "Expired" : "Open"}
                </Col>
            </Row>
            <Row>
                <Col>Repayment amount:</Col>
                <Col>
                    <AEUR amount={loan.repaymentAmount} />
                </Col>
            </Row>

            <Row>
                <Col>Due on:</Col>
                <Col>
                    {moment.unix(loan.disbursementTime).format("D MMM YYYY HH:mm")}
                    {loan.isDue ? " (payment due)" : ""}
                </Col>
            </Row>

            <Row>
                <Col>Collateral:</Col>
                <Col>
                    <ETH amount={loan.collateralAmount} /> ({loan.collateralStatus})
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
                <Col>{moment.unix(loan.disbursementTime).format("D MMM YYYY HH:mm")}</Col>
            </Row>

            <Row>
                <Col>Loan amount (disbursed):</Col>
                <Col>
                    <AEUR amount={loan.loanAmount} />
                </Col>
            </Row>
        </MyGridTable>
    );
}
