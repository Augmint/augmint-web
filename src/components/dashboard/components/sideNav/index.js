import React from "react";

import { NavLink } from "react-router-dom";

import Icon from "components/augmint-ui/icon";

import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";
import { media, mediaopacity } from "styles/media";

import AugmintLogo from "assets/images/logo/augmint.svg";
import hamburgerMenu from "assets/images/menu.svg";
import close from "assets/images/close.svg";

const breakpoint = media.desktop;

export const HamburgerMenu = styled.img`
    display: none;
    height: 32px;
    width: 32px;
    margin-top: 15px;
    visibility: hidden;

    ${breakpoint`
      display: block;
      visibility: visible;
    `};

    &.opened {
        position: absolute;
        top: 0;
        left: 0;
        margin-left: 15px;
    }
`;

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

    &.closed {
        ${breakpoint`
            width: 60px;
            height: 60px;
            padding: 0;
        `};
    }

    &.opened {
        ${mediaopacity.handheld`opacity: .97`} width: 100%;
    }

    img:not(${HamburgerMenu}) {
        width: 60px;
        margin-bottom: 20px;
        display: block;
        visibility: visible;

        ${breakpoint`
            margin-top: 40px;
            margin-bottom: 0;
            &.hidden{
                display: none;
                visibility: hidden;
            }
        `};
    }
`;

export const SideNavUl = styled.ul`
    flex-direction: column;
    align-items: baseline;
    align-self: flex-start;
    width: 100%;
    list-style: none;
    padding: 0;

    ${breakpoint`
      display: block;
      visibility: visible;
      &.hidden {
        display: none;
        visibility: hidden;
        }
    `};
`;

export const SideNavLi = styled.li`
    margin-bottom: 10px;
    width: 100%;
    ${breakpoint`
        max-width: 150px;
        margin: auto;
        text-align: left;
    `};

    &.notifications {
        display: none;

        ${media.mobile`
            display: list-item;
        `};
    }
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
        ${breakpoint`
            border: none;
        `};
    }

    > i {
        font-size: 1.5rem;
        line-height: 1.5rem;
        width: 1.5rem;
        height: 1.5rem;
    }

    > span {
        margin-left: 15px;
        line-height: 1.5rem;
        text-transform: uppercase;
        font-size: 12px;
        ${breakpoint`
            font-size: ${remCalc(20)};
            line-height: 2.4rem;
        `};
    }
`;

export default class SiteNav extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.toggleNotificationPanel = this.toggleNotificationPanel.bind(this);
    }

    toggleMenu() {
        this.props.toggleMenu();
    }

    toggleNotificationPanel(e) {
        e.preventDefault();
        this.props.toggleNotificationPanel();
    }

    render() {
        return (
            <SideNav className={this.props.showMenu ? "opened" : "closed"}>
                <HamburgerMenu
                    src={this.props.showMenu ? close : hamburgerMenu}
                    onClick={this.toggleMenu}
                    id="hamburgerMenu"
                    className={this.props.showMenu ? "opened" : ""}
                />
                <NavLink to="/">
                    <img alt="Augmint" src={AugmintLogo} className={this.props.showMenu ? "" : "hidden"} />
                </NavLink>
                <SideNavUl className={this.props.showMenu ? "" : "hidden"}>
                    <SideNavLi>
                        <SideNavLink to="/account" activeClassName="active" data-testid="myAccountMenuLink">
                            <Icon name="account" />
                            <span>Account</span>
                        </SideNavLink>
                    </SideNavLi>
                    <SideNavLi>
                        <SideNavLink to="/exchange" activeClassName="active" data-testid="exchangeMenuLink">
                            <Icon name="exchange" />
                            <span>Buy/Sell</span>
                        </SideNavLink>
                    </SideNavLi>
                    <SideNavLi>
                        <SideNavLink to="/loan" activeClassName="active" data-testid="loanMenuLink">
                            <Icon name="loan" />
                            <span>Loan</span>
                        </SideNavLink>
                    </SideNavLi>
                    <SideNavLi>
                        <SideNavLink to="/lock" activeClassName="active" data-testid="lockMenuLink">
                            <Icon name="lock" />
                            <span>Lock</span>
                        </SideNavLink>
                    </SideNavLi>
                    <SideNavLi>
                        <SideNavLink to="/stability" activeClassName="active" data-testid="reservesMenuLink">
                            <Icon name="reserves" />
                            <span>Stability</span>
                        </SideNavLink>
                    </SideNavLi>
                    <SideNavLi className="notifications">
                        <SideNavLink
                            to="/notifications"
                            activeClassName="active"
                            data-testid="notificationsMenuLink"
                            onClick={e => {
                                this.toggleMenu(e);
                                this.toggleNotificationPanel(e);
                            }}
                        >
                            <Icon name="notifications" />
                            <span>Notifications</span>
                        </SideNavLink>
                    </SideNavLi>
                </SideNavUl>
            </SideNav>
        );
    }
}
