import React from "react";
import Icon from "../icon";
import { StyledContainer, StyledItem, StyledNoItems } from "./styles";

export default function List(props) {
    const { children, ...other } = props;
    return <StyledContainer {...other}>{children}</StyledContainer>;
}

export function ListItem(props) {
    const { children, ...other } = props;
    return <StyledItem {...other}>{children}</StyledItem>;
}

List.Item = ListItem;

export function NoItems(props) {
    const { children } = props;
    return (
        <StyledNoItems>
            <Icon name="empty" />
            <h3>{children}</h3>
        </StyledNoItems>
    );
}
