import React from "react";

import { StyledMenu, StyledMenuItem, StyledMenuItemDashboard } from "./styles";

export function Menu(props) {
    const { children, className, ...other } = props;
    let _className = " menu ";
    if (className) {
        _className += className;
    }

    return (
        <StyledMenu className={ _className + " dashboardColor" } {...other}>
            {children}
        </StyledMenu>
    );
}

export function MenuItem(props) {
    const { children, className, active, ...other } = props;
    let _className = " item ";
    if (className) {
        _className += className;
    }
    if (active) {
        _className += " active ";
    }

    return (
        className!=="buySell"
            ? <StyledMenuItemDashboard className={_className} {...other}>{children}</StyledMenuItemDashboard>
            : <StyledMenuItem className={_className} {...other}>{children}</StyledMenuItem>
    );
}

Menu.Item = MenuItem;
