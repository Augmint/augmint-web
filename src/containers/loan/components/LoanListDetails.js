import React from "react";
import { NavLink } from "react-router-dom";
import moment from "moment";

import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";

export const CardTitle = styled.h1`
    margin: 0;
    font-family: ${theme.typography.fontFamilies.title};
    font-size: ${remCalc(18)};
    font-weight: normal;
`;

export const CardDescription = styled.p`
    margin: 0;
    font-size: ${remCalc(14)};
`;

export const Card = styled.section`
    position: relative;
    flex: 1 1 auto;
    width: auto;
    margin-bottom: 15px;
    padding: 10px 20px;
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

export default function LoanListDetails(props) {
    const loan = props.loan;
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const msToLeft = loan.maturity * 1000 - Date.now();
    const fromNow = moment(loan.maturity * 1000).fromNow(true);
    const { status } = statusMap.find(status => msToLeft < status.daysLeft * oneDayInMs) || {};

    return (
        <NavLink to={`/loan/${loan.id}`} style={{ flex: 1 }}>
            <Card className={status}>
                <CardTitle>
                    {loan.loanAmount} A€ loan for {moment.duration(loan.term * 1000).humanize()}
                </CardTitle>
                {(function() {
                    switch (status) {
                        case "expired":
                            return <CardDescription>Due date was expired</CardDescription>;
                        case "danger":
                            return (
                                <CardDescription>
                                    <strong>{fromNow}</strong> left to due date, please <strong>repay it</strong>
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
            </Card>
        </NavLink>
    );
}
