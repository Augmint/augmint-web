import React from "react";

import { NavLink } from "react-router-dom";

import Icon from "components/augmint-ui/icon";
import { BaseUl, BaseLi } from "components/augmint-ui/list";

import styled from 'styled-components';
import theme from "styles/theme";

import AugmintLogo from "assets/images/logo/augmint.svg";


export const SideNav = styled.nav`
    position: fixed;
    background-color: ${theme.colors.primary};
    align-items: center;
    display: flex;
    flex-direction: column;
    top: 0;
    left: 0;
    width: 180px;
    height: 100%;
    z-index: 104;
    padding: 20px 0;

    img {
        width: 60px;
        margin-bottom: 20px;
    }
`;

export const SideNavUl = BaseUl.extend`
    flex-direction: column;
    align-items: baseline;
    align-self: flex-start;
    width: 100%;
`;

export const SideNavLi = BaseLi.extend`
    margin-bottom: 10px;
    width: 100%;
`;

export const SideNavLink = styled(NavLink)`
    display: flex;
    align-items: center;
    padding: 5px 10px;
    width: 100%;
    color: ${theme.colors.white};
    opacity: 0.9;
    transition: opacity ${theme.transitions.fast};
    border-left: 3px solid transparent;
    
    &:hover {
        color: ${theme.colors.secondary};
        opacity: 1;
    }

    &.active {
        border-left-color: ${theme.colors.secondary};
        color: ${theme.colors.secondary};
        display: flex;
        align-items: center;
    }

    > i {
        font-size: 1.5rem;
        line-height: 1.5rem;
        width: 1.5rem;
        height: 1.5rem
    }

    > span {
        margin-left: 12px;
        line-height: 1.5rem;
        text-transform: uppercase;
        font-size: 12px;
    }
`;

export default props => (
    <SideNav>
        <img alt="Augmint" src={AugmintLogo} />
        <SideNavUl>
            <SideNavLi>
                <SideNavLink to="/account" activeClassName="active">
                    <Icon name="account"/>
                    <span>Account</span>
                </SideNavLink>
            </SideNavLi>
            <SideNavLi>
                <SideNavLink to="/exchange" activeClassName="active">
                    <Icon name="exchange"/>
                    <span>Buy/Sell</span>
                </SideNavLink>
            </SideNavLi>
            <SideNavLi>
                <SideNavLink to="/loan/new" activeClassName="active">
                    <Icon name="loan"/>
                    <span>Loan</span>
                </SideNavLink>
            </SideNavLi>
            <SideNavLi>
                <SideNavLink to="/lock" activeClassName="active">
                    <Icon name="lock"/>
                    <span>Lock</span>
                </SideNavLink>
            </SideNavLi>
            <SideNavLi>
                <SideNavLink to="/reserves" activeClassName="active">
                    <Icon name="reserves"/>
                    <span>Reserves</span>
                </SideNavLink>
            </SideNavLi>
        </SideNavUl>
    </SideNav>
);
