import React from "react";

import { StyledMenu, StyledMenuItem, StyledMenuItemDashboard } from "./styles";

import { FeatureContext } from "modules/services/featureService";

export function Menu(props) {
    const { children, className, ...other } = props;
    let _className = " menu ";
    if (className) {
        _className += className;
    }

    return (
        <FeatureContext>
            {features => {
                const dashboard = features.dashboard;
                return (
                    <StyledMenu className={ dashboard ? _className + " dashboardColor" : _className } {...other}>
                        {children}
                    </StyledMenu>
                );
            }}
        </FeatureContext>
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
        <FeatureContext>
            {features =>
                features.dashboard 
                    ? <StyledMenuItemDashboard className={_className} {...other}>{children}</StyledMenuItemDashboard> 
                    : <StyledMenuItem className={_className} {...other}>{children}</StyledMenuItem>
            }
        </FeatureContext>
    );
}

Menu.Item = MenuItem;
