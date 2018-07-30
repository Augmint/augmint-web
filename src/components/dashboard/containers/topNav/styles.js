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
    width: 100%;
    border-bottom: 1px solid #ccc;
    height: ${TOP_NAV_HEIGHT};
    position: absolute;
    background-color: ${theme.colors.white};
    z-index: 103;
    top: 0;
    position: fixed;

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
    margin-left: 200px;
    max-width: 60%;

    ${StyledHeaderH1} {
        font-size: ${remCalc(22)};
        margin: 0;

        ${media.mobile`
            font-size: ${remCalc(18)};
        `};
    }

    ${media.tablet`
        margin-left: 80px;
    `};
`;

export const StyledTopNavUl = styled.ul`
    display: flex;
    justify-content: flex-end;
    margin: 0;
    padding-left: 20px;
`;

// export const StyledNavBtn = styled.div`
export const StyledAccount = styled.div`
    display: none;
    &.opened {
        display: block;
    }
`;

export const StyledAccountInfo = styled(AccountInfo)`
    &:not(.opened) {
        ${media.tablet`
            display: none;
        `};
    }
`;

export const StyledTopNavLi = styled.li`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${TOP_NAV_HEIGHT};

    &.navLinkRight:hover ${StyledAccount} {
        display: block;
        position: absolute;
        right: 64px;
        top: ${TOP_NAV_HEIGHT};
    }
`;

export const StyledTopNavLink = styled(Link)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${TOP_NAV_HEIGHT};
    min-width: ${TOP_NAV_HEIGHT};
    padding: 0 2px;
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
        background-color: ${theme.colors.secondary};
        flex-direction: row;
    }

    &:hover {
        background-color: ${theme.colors.secondary};
        color: ${theme.colors.white};
    }
`;

export const StyledTopNavLinkRight = StyledTopNavLink.extend`
    display: flex;
    flex-direction: column;
    font-size: 11px;

    &:not(.accountDetails) {
        ${media.tablet`
            display: none;
        `};
    }
    &.notifications {
        border-left: solid 1px #fff;
        border-right: solid 1px #cccccc;
        :hover {
            border-right: solid 1px #fff;
        }
    }
`;

export const StyledPrice = styled.span`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: ${theme.colors.primary};
    padding: 0 12px;
    font-size: ${remCalc(14)};

    &.accountInfoContainer {
        ${media.desktop`
            display: none;
        `};
    }

    &:not(.accountInfoContainer) {
        ${media.tablet`
            display: none;
        `};
    }

    > .price {
        color: ${theme.colors.secondary};
        ${media.tablet`
            display: none;
        `};
    }

    > .accountDetailsInfo {
        color: ${theme.colors.white};
    }

    > .last-update {
        font-size: 0.75rem;
    }
`;

export const StyledSeparator = styled.div`
    background-color: ${theme.colors.white};
    padding: 0px;
    height: 24px;
    width: 2px;

    ${media.desktop`
        display: none;
    `};
`;

export const CloseIcon = styled.img`
    display: none;
    visibility: hidden;
    height: 32px;
    width: 32px;

    &.opened {
        ${media.tablet`
            display: block;
            visibility: visible;
            position: fixed;
            top: 15px;
            right: 15px;
        `};
    }
`;
