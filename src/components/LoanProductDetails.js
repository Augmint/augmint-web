import React from "react";
import { Row, Col } from "react-bootstrap";
import { mListGroupItem } from "components/mListGroups";
import {
    DiscountRateToolTip,
    LoanCollateralRatioToolTip,
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
                <Col sm={8}>Loan/collateral ratio: </Col>
                <Col sm={4}>
                    {prod.loanCollateralRatio * 100}%
                    <LoanCollateralRatioToolTip
                        loanCollateralRatio={prod.loanCollateralRatio}
                    />
                </Col>
            </Row>
            <Row>
                <Col sm={8}>Min. payout:</Col>
                <Col sm={4}>
                    {prod.minDisbursedAmountInUcd} UCD
                </Col>
            </Row>
            <Row>
                <Col sm={8}>
                    Repayment period:
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
