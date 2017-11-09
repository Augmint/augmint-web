import React from "react";
import {
    MyGridTable,
    MyGridTableRow as Row,
    MyGridTableColumn as Col
} from "components/MyListGroups";
import {
    DiscountRateToolTip,
    LoanCollateralRatioToolTip,
    RepayPeriodToolTip
} from "./LoanToolTips";

export default function LoanProductDetails(props) {
    let prod = props.product;
    return (
        <MyGridTable>
            <Row>
                <Col>
                    Discount rate:{" "}
                    <DiscountRateToolTip discountRate={prod.discountRate} />
                </Col>
                <Col>{prod.discountRate * 100}%</Col>
            </Row>
            <Row>
                <Col>
                    Loan/collateral ratio:{" "}
                    <LoanCollateralRatioToolTip
                        loanCollateralRatio={prod.loanCollateralRatio}
                    />
                </Col>
                <Col>{prod.loanCollateralRatio * 100}%</Col>
            </Row>
            <Row>
                <Col>Min. payout:</Col>
                <Col>{prod.minDisbursedAmountInUcd} ACD</Col>
            </Row>
            <Row>
                <Col>
                    Repayment period: <RepayPeriodToolTip />
                </Col>
                <Col>{prod.repayPeriodText}</Col>
            </Row>
        </MyGridTable>
    );
}
