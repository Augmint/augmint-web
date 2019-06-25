import React from "react";
import moment from "moment";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { media } from "styles/media";
import Button from "components/augmint-ui/button";
import { StyledStatusBox, StyledStatusText } from "components/augmint-ui/baseComponents/styles";
import { Pgrid } from "components/PageLayout";
import CollectLoanButton from "../collectLoan/CollectLoanButton";
import { AEUR, ETH } from "components/augmint-ui/currencies";
// import moment from '../../../modules/ethereum/loanTransactions';

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

export default function LoanCard(props) {
    const { loan, loanManager } = props;

    return (
        <Card className={loan.dueState}>
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
                            <div>
                                <CardStatusInfo>
                                    <strong>{moment.unix(loan.maturity).fromNow(true)}</strong> left to due date
                                </CardStatusInfo>
                                <CardStatusHelp>
                                    {loan.isDue
                                        ? "Near to due date. You will have to pay back soon."
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
                            alignItems: "flex-start",
                            flexBasis: "unset",
                            marginLeft: "auto",
                            padding: "1rem"
                        }}
                    >
                        {loan.isRepayable && (
                            <Button to={"/loan/repay/" + loan.id}>{loan.isDue ? "Repay" : "Repay Early"}</Button>
                        )}

                        {loan.isCollectable && (
                            <CollectLoanButton
                                idName="card-collect-btn"
                                loanManager={loanManager}
                                loansToCollect={[loan]}
                            />
                        )}
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        </Card>
    );
}
