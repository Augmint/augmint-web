import React from "react";
import {
    MyGridTable,
    MyGridTableRow as Row,
    MyGridTableColumn as Col
} from "components/MyListGroups";
import { Button } from "semantic-ui-react";
import { Link } from "react-router-dom";

export default function LoanListDetails(props) {
    let loan = props.loan;
    return (
        <MyGridTable header={loan.loanStateText + " loan #" + loan.loanId}>
            <Row>
                <Col>Loan amount:</Col>
                <Col>{loan.ucdDueAtMaturity} UCD</Col>
            </Row>

            <Row>
                <Col>{loan.isDue ? "Pay by:" : "Due on:"}</Col>
                <Col>{loan.isDue ? loan.repayByText : loan.maturityText}</Col>
            </Row>
            <Row>
                <Col>
                    <Button
                        content="Details"
                        as={Link}
                        key={"selectlink-" + loan.loanId}
                        to={`/loan/${loan.loanId}`}
                        labelPosition="right"
                        icon="right chevron"
                        basic
                    />
                    {loan.isDue && (
                        <Button
                            content="Repay"
                            as={Link}
                            key={"repaybtn-" + loan.loanId}
                            to={`/loan/repay/${loan.loanId}`}
                            labelPosition="right"
                            icon="right chevron"
                            primary
                        />
                    )}
                </Col>
            </Row>
        </MyGridTable>
    );
}
