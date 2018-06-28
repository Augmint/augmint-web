import React from "react";
import moment from "moment";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import { LoanInterestRatePaToolTip, LoanCollateralRatioToolTip, DefaultingFeeTooltip } from "./LoanToolTips";

export default function LoanProductDetails(props) {
    const prod = props.product;
    const collateralRatio = Number((prod.collateralRatio * 100).toFixed(2));
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
                    Interest p.a.:{" "}
                    <LoanInterestRatePaToolTip
                        interestRatePa={prod.interestRatePa}
                        id={"Loan_interest_rate_pa_tooltip"}
                    />
                </Col>
                <Col>{Math.round(prod.interestRatePa * 10000) / 100}%</Col>
            </Row>
            <Row>
                <Col>
                    Loan/collateral ratio:{" "}
                    <LoanCollateralRatioToolTip
                        collateralRatio={collateralRatio}
                        id={"loan_collateral_ratio_tooltip"}
                    />
                </Col>
                <Col>{collateralRatio}%</Col>
            </Row>
            <Row>
                <Col>Min / max payout:</Col>
                <Col>
                    {prod.minDisbursedAmountInToken} A-EUR / {prod.maxLoanAmount} A-EUR
                </Col>
            </Row>
            <Row>
                <Col>
                    Defaulting fee: <DefaultingFeeTooltip id={"defaulting_fee_tooltip"} />
                </Col>
                <Col>{prod.defaultingFeePt * 100} %</Col>
            </Row>
        </MyGridTable>
    );
}
