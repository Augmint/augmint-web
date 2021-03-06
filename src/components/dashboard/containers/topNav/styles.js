import styled from "styled-components";
import theme from "styles/theme";
import AccountInfo from "components/accountInfo";

import { Link } from "react-router-dom";
import { StyledHeaderH1 } from "components/augmint-ui/header/styles";

import { remCalc } from "styles/theme";
import { media } from "styles/media";

const TOP_NAV_HEIGHT = "60px";

export const StyledTopNav = styled.nav`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: ${TOP_NAV_HEIGHT};
    position: absolute;
    background-color: ${theme.colors.white};
    z-index: 103;
    top: 0;
    position: fixed;
    border-bottom: 2px solid ${theme.colors.bgGrey};

    &.hide {
        display: none;
    }

    ${media.tablet`
        &.hidden {
            z-index: 105;
        }
    `};
`;

export const TitleWrapper = styled.div`
    margin-left: 230px;
    max-width: 60%;

    ${StyledHeaderH1} {
        font-size: ${remCalc("20")};
        margin: 0;
        font-weight: 700;
        color: ${theme.colors.primary};

        ${media.desktop`
            font-size: 1.1rem;
        `};
    }

    ${media.desktop`
        margin-left: 80px;
    `};
`;

export const StyledTopNavUl = styled.ul`
    display: flex;
    justify-content: flex-end;
    margin: 0;
    padding-left: 10px;
`;

export const StyledAccount = styled.div`
    display: none;
    &.opened {
        ${media.tablet`
            display: block;
        `};
    }
`;

export const StyledAccountInfo = styled(AccountInfo)`
    &:not(.opened) {
        ${media.tablet`
            display: none;
        `};
    }

    margin: 0;
`;

export const StyledTopNavLi = styled.li`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${TOP_NAV_HEIGHT};
`;

export const StyledTopNavLink = styled(Link)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${TOP_NAV_HEIGHT};
    min-width: ${TOP_NAV_HEIGHT};
    padding: 0;
    color: ${theme.colors.primary};
    transition: all ${theme.transitions.fast};
    transition-property: background-color, color;

    > i {
        font-size: 1.5rem;
        height: 1.5rem;
        width: 1.5rem;
        &.opened {
            ${media.tablet`
                visibility: hidden;
            `};
        }
    }

    &.accountDetails {
        padding-left: 4px;
    }

    &:hover {
        background-color: ${theme.colors.secondary};
        color: ${theme.colors.primary};
    }

    &.notifications {
        &.open {
            background-color: ${theme.colors.secondaryDark};
            color: ${theme.colors.primary};
        }
    }
`;

export const StyledTopNavLinkRight = styled(StyledTopNavLink)`
    display: flex;
    flex-direction: column;
    font-size: 11px;

    &.accountDetails {
        ${media.tabletMin`
            cursor: default;
            pointer-events: none;
            min-width: 50px;
        `}
        span {
            ${media.tabletMin`
                display: none;
            `}
        }
    }

    &:not(.accountDetails) {
        ${media.mobile`
            display: none;
        `};

        &:not(.notifications) {
            ${media.tablet`
                display: none;
            `};
        }
    }
`;

export const StyledPrice = styled.span`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: ${theme.colors.primary};
    margin: 2px 8px 0;
    font-size: ${remCalc(14)};

    :first-of-type {
        margin-left: 0;
    }

    ${media.desktop`
        font-size: ${remCalc(12)};
    `}

    ${media.tabletMin`
        margin-top: 3px;
    `}

    &.accountInfoContainer {
        ${media.tablet`
            display: none;
        `};
    }

    span .symbol {
        font-weight: 400;
    }
`;

export const CloseIcon = styled.img`
    display: none;
    visibility: hidden;
    height: 32px;
    width: 32px;
    cursor: pointer;

    &.opened {
        ${media.tablet`
            display: block;
            visibility: visible;
            position: fixed;
            top: 15px;
            right: 15px;
            z-index: 2;
        `};
    }
`;
