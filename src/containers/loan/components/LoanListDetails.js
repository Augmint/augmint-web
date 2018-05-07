import React from "react";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import Button from "components/augmint-ui/button";
import { Link } from "react-router-dom";
import { LoanRepayLink } from "./LoanRepayLink";

export default function LoanListDetails(props) {
    let loan = props.loan;
    return (
        <MyGridTable header={loan.loanStateText + " loan #" + loan.id}>
            <Row>
                <Col>Repayment amount:</Col>
                <Col>{loan.repaymentAmount} A-EUR</Col>
            </Row>

            <Row>
                <Col>Pay by:</Col>
                <Col>{loan.maturityText}</Col>
            </Row>
            <Row columns={1}>
                <Col>
                    <Button
                        content="Details"
                        as={Link}
                        key={"selectlink-" + loan.id}
                        to={`/loan/${loan.id}`}
                        labelposition="right"
                        icon="right chevron"
                        basic
                    />
                    <LoanRepayLink loan={loan} />
                </Col>
            </Row>
        </MyGridTable>
    );
}
