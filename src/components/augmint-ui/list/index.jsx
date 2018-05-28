import React from "react";

import { StyledContainer, StyledItem } from "./styles";

export default function List(props) {
    const { children, ...other } = props;
    return <StyledContainer {...other}>{children}</StyledContainer>;
}

export function ListItem(props) {
    const { children, ...other } = props;
    return <StyledItem {...other}>{children}</StyledItem>;
}

List.Item = ListItem;
