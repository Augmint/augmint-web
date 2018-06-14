import React from "react";
import { FeatureContext } from "modules/services/featureService";

import { StyledContainer, StyledLabel, StyledValue, StyledGroup } from "./styles";

export default function Statistic(props) {
    const { label, value, children, className, ...other } = props;
    return (
        <FeatureContext>
            {features => {
                const dashboard = features.dashboard;
                const classNameString = className ? className : "";
                return (
                    <StyledContainer {...other} className={classNameString + (dashboard && " dashboard")}>
                        {label && <StyledLabel>{label}</StyledLabel>}
                        {value && <StyledValue>{value}</StyledValue>}
                        {children}
                    </StyledContainer>
                );
            }}
        </FeatureContext>
    );
}

export function StatisticGroup(props) {
    const { children, ...other } = props;
    return <StyledGroup {...other}>{children}</StyledGroup>;
}

Statistic.Group = StatisticGroup;
