import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { StyledStatusBox } from "components/augmint-ui/baseComponents/styles";

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

export default function LockListDetails(props) {
    const { lock } = props;

    return (
        <NavLink to={`/lock/${lock.id}`} style={{ flex: 1 }}>
            <Card className={lock.lockStateText === "Ready to release" ? "ReadyToRelease" : "NotReadyToRelease"}>
                <CardTitle>
                    {lock.amountLocked} A€ lock for {lock.durationText}
                </CardTitle>
                <CardDescription>
                    {lock.isReleasebale ? (
                        <span>
                            <strong>Ready to release</strong>
                        </span>
                    ) : (
                        <span>
                            <strong>Releasable in {lock.durationText}.</strong>
                        </span>
                    )}
                </CardDescription>
            </Card>
        </NavLink>
    );
}
