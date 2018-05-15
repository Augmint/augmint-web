import React from "react";

import { StyledMenu, StyledMenuItem } from "./styles";

export function Menu(props) {
    const { children, className, ...other } = props;
    let _className = " menu ";
    if (className) {
        _className += className;
    }
    return (
        <StyledMenu className={_className} {...other}>
            {children}
        </StyledMenu>
    );
}

export function MenuItem(props) {
    const { children, className, active, name, ...other } = props;
    let _className = " item ";
    if (className) {
        _className += className;
    }
    if (active) {
        _className += " active ";
    }
    return (
        <StyledMenuItem className={_className} name={name} {...other}>
            {children}
        </StyledMenuItem>
    );
}

Menu.Item = MenuItem;
