import React from "react";
import { Row, Col } from "react-bootstrap";
import { mListGroupItem } from "components/mListGroups";
import {
    DiscountRateToolTip,
    LoanCoverageRatioToolTip,
    RepayPeriodToolTip
} from "./LoanToolTips";

import "./LoanProductDetails.css";

export default function LoanProductDetails(props) {
    let prod = props.product;
    return (
        <mListGroupItem
            header={"Product " + (prod.id + 1) + " - Repay in " + prod.termText}
            key={prod.id}
        >
            <Row>
                <Col sm={8}>Discount rate: </Col>
                <Col sm={4}>
                    {prod.discountRate * 100}%
                    <DiscountRateToolTip discountRate={prod.discountRate} />
                </Col>
            </Row>
            <Row>
                <Col sm={8}>Loan coverage ratio: </Col>
                <Col sm={4}>
                    {prod.loanCoverageRatio * 100}%
                    <LoanCoverageRatioToolTip
                        loanCoverageRatio={prod.loanCoverageRatio}
                    />
                </Col>
            </Row>
            <Row>
                <Col sm={8}>Min disbursed loan amount:</Col>
                <Col sm={4}>
                    {prod.minDisbursedAmountInUcd} UCD
                </Col>
            </Row>
            <Row>
                <Col sm={8}>
                    Repay period:
                </Col>
                <Col sm={4}>
                    {prod.repayPeriodText} <RepayPeriodToolTip />
                </Col>
            </Row>

            {props.selectComponent &&
                <Row>
                    <Col sm={12}>
                        <props.selectComponent productId={prod.id} />
                    </Col>
                </Row>}
            <Row bsClass="rowSeparator" />
        </mListGroupItem>
    );
}
