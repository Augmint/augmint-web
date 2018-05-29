import React from "react";

import { StyledContainer, StyledLabel, StyledValue, StyledGroup } from "./styles";

export default function Statistic(props) {
    const { label, value, children, ...other } = props;
    return (
        <StyledContainer {...other}>
            {label && <StyledLabel>{label}</StyledLabel>}
            {value && <StyledValue>{value}</StyledValue>}
            {children}
        </StyledContainer>
    );
}

export function StatisticGroup(props) {
    const { children, ...other } = props;
    return <StyledGroup {...other}>{children}</StyledGroup>;
}

Statistic.Group = StatisticGroup;
