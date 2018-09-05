import React from "react";
import moment from "moment";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import Button from "components/augmint-ui/button";
import { Pgrid } from "components/PageLayout";

export const CardHead = styled.div`
    display: flex;
`;

export const CardTitle = styled.h1`
    margin: 0 auto 0 0;
    font-family: ${theme.typography.fontFamilies.title};
    font-size: ${remCalc(18)};
    font-weight: normal;
`;

export const CardStatus = styled.div`
    font-size: ${remCalc(14)};
    font-weight: bold;
    text-transform: uppercase;

    &.active {
        color: ${theme.colors.green};
    }
`;

export const CardDescription = styled.p`
    margin: 0;
    padding: 20px;
    border: 1px solid ${theme.colors.grey};
    font-family: ${theme.typography.fontFamilies.title};
    font-size: ${remCalc(14)};
    text-align: center;

    strong {
        display: block;
        font-size: ${remCalc(24)};
    }
`;

export const Card = styled.section`
    position: relative;
    margin-top: 30px;
    margin-bottom: 30px;
    padding: 20px;
    background: ${theme.colors.white};
    border: 1px solid ${theme.colors.grey};
    color: ${theme.colors.black};

    ${CardDescription} {
        color: ${theme.colors.mediumGrey};
    }

    &.expired,
    &.danger {
        color: ${theme.colors.white};
        background: ${theme.colors.red};
        border: 0;

        ${CardDescription} {
            color: ${theme.colors.white};
        }
    }

    &.warning {
        ${CardDescription} {
            color: ${theme.colors.red};
        }
    }
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

const statusMap = [
    {
        daysLeft: 0,
        status: "expired"
    },
    {
        daysLeft: 3,
        status: "danger"
    },
    {
        daysLeft: 7,
        status: "warning"
    }
];

export default function LoanCard(props) {
    const loan = props.loan;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const msToLeft = loan.maturity * 1000 - Date.now();
    const fromNow = moment(loan.maturity * 1000).fromNow(true);
    const { status } = statusMap.find(status => msToLeft < status.daysLeft * oneDayInMs) || {};

    return (
        <Card className={status}>
            <CardHead>
                <CardTitle>
                    {loan.loanAmount} A€ loan for {moment.duration(loan.term * 1000).humanize()}
                </CardTitle>
                <CardStatus className="active">{loan.loanStateText} loan</CardStatus>
            </CardHead>
            <Pgrid style={{ marginLeft: -15, marginRight: -15 }}>
                <Pgrid.Row>
                    <Pgrid.Column size={{ desktop: 1 / 3 }}>
                        {(function() {
                            switch (status) {
                                case "expired":
                                    return <CardDescription>Due date was expired</CardDescription>;
                                case "danger":
                                    return (
                                        <CardDescription>
                                            <strong>{fromNow}</strong> left to due date
                                        </CardDescription>
                                    );
                                case "warning":
                                    return (
                                        <CardDescription>
                                            <strong>{fromNow}</strong> left to due date
                                        </CardDescription>
                                    );
                                default:
                                    return (
                                        <CardDescription>
                                            <strong>{fromNow}</strong> left to due date
                                        </CardDescription>
                                    );
                            }
                        })()}
                    </Pgrid.Column>
                    <Pgrid.Column size={{ desktop: 1 / 3 }}>
                        <DataGroup>
                            <DataRow>
                                <DataLabel>
                                    <strong>Disbursed</strong>
                                </DataLabel>
                                <DataValue>on {loan.disbursementTimeText}</DataValue>
                            </DataRow>
                            <DataRow>
                                <DataLabel>Amount:</DataLabel>
                                <DataValue>{loan.loanAmount} A-EUR</DataValue>
                            </DataRow>
                            <DataRow>
                                <DataLabel>Collateral:</DataLabel>
                                <DataValue>{loan.collateralEth} ETH</DataValue>
                            </DataRow>
                        </DataGroup>
                        <DataGroup>
                            <DataRow>
                                <DataLabel>
                                    <strong>Repayment</strong>
                                </DataLabel>
                                <DataValue>on {loan.maturityText}</DataValue>
                            </DataRow>
                            <DataRow>
                                <DataLabel>Amount:</DataLabel>
                                <DataValue>{loan.repaymentAmount} A-EUR</DataValue>
                            </DataRow>
                        </DataGroup>
                    </Pgrid.Column>
                    <Pgrid.Column
                        size={{ desktop: 1 / 3 }}
                        style={{
                            display: "flex",
                            alignItems: "flex-end",
                            flexBasis: "unset",
                            marginLeft: "auto",
                            padding: "1rem"
                        }}
                    >
                        {loan.isRepayable && (
                            <Button to={"/loan/repay/" + loan.id}>{loan.isDue ? "Repay" : "Repay Early"}</Button>
                        )}
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        </Card>
    );
}
