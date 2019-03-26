import React from "react";
import moment from "moment";
import { MyGridTable, MyGridTableRow as Row, MyGridTableColumn as Col } from "components/MyListGroups";
import { LoanInterestRatePaToolTip, LoanCollateralRatioToolTip, DefaultingFeeTooltip } from "./LoanToolTips";

export default function LoanProductDetails(props) {
    const prod = props.product;
    const repaymentAmount = props.repaymentAmount;
    const collateralRatio = Number((prod.collateralRatio * 100).toFixed(2));
    return (
        <MyGridTable>
            <Row>
                <Col>
                    <strong>Repayment amount:</strong>
                </Col>
                <Col data-testid="repaymentAmount">
                    <strong>{repaymentAmount || 0} A-EUR</strong>
                </Col>
            </Row>
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
                        interestRatePaPt={prod.interestRatePaPt}
                        id={"Loan_interest_rate_pa_tooltip"}
                    />
                </Col>
                <Col>{prod.interestRatePaPt}%</Col>
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
                <Col>Min / max loan:</Col>
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
