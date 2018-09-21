import React from "react";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { media } from "styles/media";
import ReleaseFundsButton from "../components/ReleaseFundsButton";
import { StyledStatusBox, StyledStatusText } from "components/augmint-ui/baseComponents/styles";
import { Pgrid } from "components/PageLayout";

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

    .ReadyToRelease &,
    &.ReadyToRelease {
        color: ${theme.colors.green};
    }

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

export default function LockCard(props) {
    const lock = props.lock;

    return (
        <Card className={lock.dueState}>
            <CardHead>
                <CardTitle>
                    {lock.amountLocked} A€ lock for {lock.durationText}
                </CardTitle>
                <CardStatus>{lock.lockStateText} lock</CardStatus>
            </CardHead>
            <Pgrid style={{ marginLeft: -15, marginRight: -15 }}>
                <Pgrid.Row>
                    <Pgrid.Column size={{ desktop: 1 / 3 }}>
                        {lock.isReleasebale ? (
                            <CardStatusInfo className="ReadyToRelease">
                                <strong>Ready to release</strong>
                            </CardStatusInfo>
                        ) : lock.isActive ? (
                            <CardStatusInfo>
                                <strong>Releasable in {lock.durationText}</strong>
                            </CardStatusInfo>
                        ) : (
                            <CardStatusInfo>
                                <strong>Released at {lock.lockedUntilText}</strong>
                            </CardStatusInfo>
                        )}
                    </Pgrid.Column>
                    <Pgrid.Column size={{ desktop: 1 / 3 }}>
                        <DataGroup>
                            <DataRow>
                                <DataLabel>
                                    <strong>Locked for {lock.durationText}</strong>
                                </DataLabel>
                                <DataValue>until {lock.lockedUntilText}</DataValue>
                            </DataRow>
                            <DataRow>
                                <DataLabel>Locked amount:</DataLabel>
                                <DataValue>{lock.amountLocked} A-EUR</DataValue>
                            </DataRow>
                            <DataRow>
                                <DataLabel>Interest amount:</DataLabel>
                                <DataValue>
                                    {lock.interestEarned} A-EUR ({(lock.interestRatePa * 100).toFixed(2)} % p.a)
                                </DataValue>
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
                        data-testid={`lockCard`}
                    >
                        {lock.isReleasebale && <ReleaseFundsButton lockId={lock.id} />}
                    </Pgrid.Column>
                </Pgrid.Row>
            </Pgrid>
        </Card>
    );
}
