import React from "react";
import moment from "moment";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import { DiscountRateToolTip, LoanCollateralRatioToolTip, DefaultingFeeTooltip } from "./LoanToolTips";

export default function LoanProductDetails(props) {
    let prod = props.product;
    return (
        <MyGridTable>
            <Row>
                <Col>Repay:</Col>
                <Col>
                    in {prod.termText}, before {moment.unix(prod.termInSecs + moment.utc().unix()).format("D MMM YYYY")}
                </Col>
            </Row>
            <Row>
                <Col>
                    Interest p.a.: <DiscountRateToolTip discountRate={prod.discountRate} />
                </Col>
                <Col>{Math.round(prod.interestRatePa * 10000) / 100}%</Col>
            </Row>
            <Row>
                <Col>
                    Loan/collateral ratio: <LoanCollateralRatioToolTip loanCollateralRatio={prod.loanCollateralRatio} />
                </Col>
                <Col>{prod.collateralRatio * 100}%</Col>
            </Row>
            <Row>
                <Col>Min / max payout:</Col>
                <Col>
                    {prod.minDisbursedAmountInToken} A-EUR / {prod.maxLoanAmount} A-EUR
                </Col>
            </Row>
            <Row>
                <Col>
                    Defaulting fee: <DefaultingFeeTooltip />
                </Col>
                <Col>{prod.defaultingFeePt * 100} %</Col>
            </Row>
        </MyGridTable>
    );
}
