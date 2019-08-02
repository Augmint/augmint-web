import React from "react";
import moment from "moment";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { media } from "styles/media";
import Button from "components/augmint-ui/button";
import { StyledStatusBox, StyledStatusText } from "components/augmint-ui/baseComponents/styles";
import { Pgrid } from "components/PageLayout";
import CollectLoanButton from "../collectLoan/CollectLoanButton";
import { AEUR, ETH, Percent } from "components/augmint-ui/currencies";
import AddCollateralButton from "../components/AddCollateralButton";
import { Tokens } from "@augmint/js";

export const CardHead = styled.div`
    display: flex;
    ${media.tablet`
        flex-direction: column;
    `};
`;

export const CardTitle = styled.h1`
    margin: 0 auto 0 0;
    font-family: ${theme.typography.fontFamilies.title};
    font-size: ${remCalc(18)};
    font-weight: normal;
`;

export const CardStatus = styled.div`
    font-size: ${remCalc(14)};
    text-transform: uppercase;
    color: ${theme.colors.mediumGrey};
`;

export const CardStatusInfo = styled(StyledStatusBox)`
    text-align: center;

    strong {
        display: block;
        font-size: ${remCalc(24)};
        margin-bottom: 5px;
    }

    .margin-loan &,
    .margin-loan & strong {
        font-size: ${remCalc(16)};
    }

    h1 {
        margin: 0 0 15px;
        font-size: ${remCalc(20)};
    }

    .percent {
        font-size: ${remCalc(22)};
    }

    .bold {
        color: ${theme.colors.black};
        margin-bottom: 15px;
    }

    .warning & .bold {
        color: ${theme.colors.red};
    }
`;

export const CardStatusHelp = styled(StyledStatusText)``;

export const Card = styled.section`
    position: relative;
    margin-top: 30px;
    margin-bottom: 30px;
    padding: 20px;
    background: ${theme.colors.white};
    border: 1px solid ${theme.colors.grey};
    color: ${theme.colors.black};
`;

export const DataGroup = styled.div`
    & + & {
        margin-top: 10px;
        padding-top: 10px;
        border-top: 1px solid ${theme.colors.grey};
    }
`;

export const DataRow = styled.div`
    display: flex;
    padding-top: 5px;
    padding-bottom: 5px;
    font-size: ${remCalc(14)};
`;

export const DataLabel = styled.div`
    margin-right: auto;
`;
export const DataValue = styled.div``;

export function LoanCard(props) {
    const { loan } = props;
    const loanManagerAddress = loan.loanManagerAddress;

    return (
        <Card>
            <CardHead>
                <CardTitle>
                    <AEUR amount={loan.loanAmount} /> loan for {moment.duration(loan.term, "seconds").humanize()}
                </CardTitle>
                <CardStatus>{loan.isRepayable ? "Active" : "Expired"} loan</CardStatus>
            </CardHead>
            <Pgrid style={{ marginLeft: -15, marginRight: -15 }}>
                <Pgrid.Row>
                    <Pgrid.Column style={{ padding: "1rem" }} size={{ desktop: 1 / 3 }}>
                        {loan.isRepayable ? (
                            <div className={loan.dueState}>
                                <CardStatusInfo>
                                    <strong>{moment.unix(loan.maturity).fromNow(true)}</strong> left to due date
                                </CardStatusInfo>
                                <CardStatusHelp>
                                    {loan.isDue
                                        ? "Near due date. You will have to pay back soon."
                                        : "You can repay at any time."}
                                </CardStatusHelp>
                            </div>
                        ) : (
                            <CardStatusInfo>{loan.loanStateText}</CardStatusInfo>
                        )}
                    </Pgrid.Column>
                    <Pgrid.Column style={{ padding: "1rem" }} size={{ desktop: 1 / 3 }}>
                        <DataGroup>
                            <DataRow>
                                <DataLabel>
                                    <strong>Disbursed</strong>
                                </DataLabel>
                                <DataValue>
                                    on {moment.unix(loan.disbursementTime).format("D MMM YYYY HH:mm")}
                                </DataValue>
                            </DataRow>
                            <DataRow>
                                <DataLabel>Amount:</DataLabel>
                                <AEUR amount={loan.loanAmount} />
                            </DataRow>
                            <DataRow>
                                <DataLabel>Collateral:</DataLabel>
                                <ETH amount={loan.collateralAmount} />
                            </DataRow>
                        </DataGroup>
                        <DataGroup>
                            <DataRow>
                                <DataLabel>
                                    <strong>Repayment</strong>
                                </DataLabel>
                                <DataValue>on {moment.unix(loan.maturity).format("D MMM YYYY HH:mm")}</DataValue>
                            </DataRow>
                            <DataRow>
                                <DataLabel>Amount:</DataLabel>
                                <AEUR amount={loan.repaymentAmount} />
                            </DataRow>
                        </DataGroup>
                    </Pgrid.Column>
                    <Pgrid.Column
                        size={{ desktop: 1 / 3 }}
                        style={{
                            display: "flex",
                            flexBasis: "unset",
                            marginLeft: "auto",
                            padding: "1rem",
                            flexDirection: "column"
                        }}
                    >
                        {loan.isRepayable && (
                            <Button
                                style={{ marginBottom: "10px", alignSelf: "flex-end" }}
                                to={`/loan/repay/${loan.id}/${loanManagerAddress}`}
                            >
                                {loan.isDue ? "Repay" : "Repay Early"}
                            </Button>
                        )}
                        {loan.isCollectable && <CollectLoanButton idName="card-collect-btn" loansToCollect={[loan]} />}
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        </Card>
    );
}
export function MarginLoanCard(props) {
    const { loan, products, rate } = props;

    if (products && products.length > 0) {
        const loanManagerAddress = loan.loanManagerAddress;
        const loanProductId = loan.productId;
        const product = products.find(
            product => product.id === loanProductId && product.loanManagerAddress === loanManagerAddress
        );
        const currentCollateralRatio = loan.calculateCollateralRatio(Tokens.of(rate));
        const addCollateralAmount = loan.calculateCollateralChange(Tokens.of(rate), product.initialCollateralRatio);
        const addCollateralValue = addCollateralAmount.toNumber() > 0 ? addCollateralAmount.toNumber() : 0;

        return (
            <Card className="margin-loan">
                <CardHead>
                    <CardTitle>
                        <AEUR amount={loan.loanAmount} /> loan for {moment.duration(loan.term, "seconds").humanize()}
                    </CardTitle>
                    <CardStatus>{loan.isRepayable ? "Active" : "Expired"} margin loan</CardStatus>
                </CardHead>
                <Pgrid style={{ marginLeft: -15, marginRight: -15 }}>
                    <Pgrid.Row>
                        <Pgrid.Column style={{ padding: "1rem" }} size={{ desktop: 1 / 3 }}>
                            {loan.isRepayable ? (
                                <div className={loan.dueState}>
                                    <CardStatusInfo>
                                        <strong>{moment.unix(loan.maturity).fromNow(true)}</strong> left to due date
                                    </CardStatusInfo>
                                    <CardStatusHelp>
                                        {loan.isDue
                                            ? "Near due date. You will have to pay back soon."
                                            : "You can repay at any time."}
                                    </CardStatusHelp>
                                </div>
                            ) : (
                                <CardStatusInfo>{loan.loanStateText}</CardStatusInfo>
                            )}
                            {loan.isRepayable && (
                                <div className={loan.marginWarning ? "warning" : ""}>
                                    <CardStatusInfo>
                                        <h1>Collateralization Ratios</h1>
                                        <strong className="bold">
                                            current is{" "}
                                            <span className="percent">
                                                <Percent amount={currentCollateralRatio} />
                                            </span>{" "}
                                            at <AEUR isRate={true} amount={rate} />
                                        </strong>
                                        minimum is{" "}
                                        <span className="percent">
                                            <Percent amount={product.minCollateralRatio} />
                                        </span>{" "}
                                        at <AEUR isRate={true} amount={loan.marginCallRate} />
                                    </CardStatusInfo>
                                    {loan.marginWarning && (
                                        <div>
                                            <CardStatusHelp className="warning">
                                                The current rate is getting close to margin rate.
                                            </CardStatusHelp>
                                        </div>
                                    )}
                                    <AddCollateralButton loan={loan} rate={rate} value={addCollateralValue} />
                                </div>
                            )}
                        </Pgrid.Column>
                        <Pgrid.Column style={{ padding: "1rem" }} size={{ desktop: 1 / 3 }}>
                            <DataGroup>
                                <DataRow>
                                    <DataLabel>
                                        <strong>Disbursed</strong>
                                    </DataLabel>
                                    <DataValue>
                                        on {moment.unix(loan.disbursementTime).format("D MMM YYYY HH:mm")}
                                    </DataValue>
                                </DataRow>
                                <DataRow>
                                    <DataLabel>Amount:</DataLabel>
                                    <AEUR amount={loan.loanAmount} />
                                </DataRow>
                                <DataRow>
                                    <DataLabel>Collateral:</DataLabel>
                                    <ETH amount={loan.collateralAmount} />
                                </DataRow>
                            </DataGroup>
                            <DataGroup>
                                <DataRow>
                                    <DataLabel>
                                        <strong>Repayment</strong>
                                    </DataLabel>
                                    <DataValue>on {moment.unix(loan.maturity).format("D MMM YYYY HH:mm")}</DataValue>
                                </DataRow>
                                <DataRow>
                                    <DataLabel>Amount:</DataLabel>
                                    <AEUR amount={loan.repaymentAmount} />
                                </DataRow>
                            </DataGroup>
                        </Pgrid.Column>
                        <Pgrid.Column
                            size={{ desktop: 1 / 3 }}
                            style={{
                                display: "flex",
                                flexBasis: "unset",
                                marginLeft: "auto",
                                padding: "1rem",
                                flexDirection: "column"
                            }}
                        >
                            {loan.isRepayable && (
                                <Button
                                    style={{ marginBottom: "10px", alignSelf: "flex-end" }}
                                    to={`/loan/repay/${loan.id}/${loanManagerAddress}`}
                                >
                                    {loan.isDue ? "Repay" : "Repay Early"}
                                </Button>
                            )}
                            {loan.isCollectable && (
                                <CollectLoanButton idName="card-collect-btn" loansToCollect={[loan]} />
                            )}
                        </Pgrid.Column>
                    </Pgrid.Row>
                </Pgrid>
            </Card>
        );
    }
}
