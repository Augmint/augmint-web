import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import moment from "moment";
import { default as theme, remCalc } from "styles/theme";
import { StyledStatusBox } from "components/augmint-ui/baseComponents/styles";
import { AEUR, ETH } from "components/augmint-ui/currencies";

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

export const Card = styled(StyledStatusBox)`
    flex: 1 1 auto;
    width: auto;
    margin-bottom: 15px;
    padding: 10px 20px;
    color: ${theme.colors.black};
`;

export default function LoanListDetails(props) {
    const loan = props.loan;

    console.log("details", loan);

    return (
        <NavLink to={`/loan/${loan.id}`} style={{ flex: 1 }}>
            <Card className={loan.dueState}>
                <CardTitle>
                    <AEUR amount={loan.loanAmount} /> loan for {moment.duration(loan.term, "seconds").humanize()}
                </CardTitle>
                <CardDescription>
                    {loan.isRepayable ? (
                        <span>
                            <strong>{moment.unix(loan.maturity).fromNow(true)}</strong> left to due date
                            {loan.isDue && (
                                <span>
                                    , please <strong>repay it</strong>
                                </span>
                            )}
                        </span>
                    ) : (
                        loan.loanStateText
                    )}
                </CardDescription>
            </Card>
        </NavLink>
    );
}
