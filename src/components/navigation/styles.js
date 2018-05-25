import styled from "styled-components";
import { ifProp } from "styled-tools";

import { NavLink } from "react-router-dom";

import theme from "styles/theme";
import { media, mediaopacity } from "styles/media";

export const StyleNavList = styled.ul`
    display: flex;
    padding: 0;
    margin: 0;
    ${media.tablet`
      margin-top: 25px;
      display: none;
      position: absolute;
      left: 0;
      right: 0;
    `};
`;

export const StyleNavLink = styled(NavLink)`
    font-size: 13px;
    letter-spacing: 2.6px;
    text-transform: uppercase;
    white-space: nowrap;
    color: ${ifProp("active", theme.colors.white, theme.colors.opacWhite)};
    transition: color ${theme.transitions.standard};

    &:hover,
    &.active {
        color: ${theme.colors.white};
    }
`;

export const StyleNavItem = styled.li`
    display: flex;
    ${media.tablet`
      text-align: center;

    `} & + li {
        margin-left: 8px;
        ${media.tablet`
          margin-left: 0px;
        `};
    }

    & a {
        padding: 15px 5px;
        width: 100%;
        ${media.tablet`
        font-size: 18px;
      `};
    }

    &.augmint img {
        max-height: 50px;
        max-width: none;
    }
`;

export const StyledLogoContainer = styled.div`
    display: flex;
    justify-content: center;
    min-height: 80px;
`;

export const StyledNavLeftSide = styled.div`
    display: flex;

    & img.augmint {
        max-height: 50px;
        padding-right: 10px;
        ${media.tablet`
          display: none;
        `};
    }
`;

export const StyledLogo = styled.img`
    margin-top: 80px;
`;

export const HamburgerMenu = styled.img`
    display: none;
    height: 32px;
    width: 32px;
    visibility: hidden;
    ${mediaopacity.handheld`opacity: .8`} ${media.tablet`
      display: block;
      visibility: visible;
    `};
`;

export const StyledNavContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    position: fixed;
    width: 100%;
    padding: 15px;
    z-index: 3;
    background-color: ${theme.colors.primary};

    &.opened {
        ${mediaopacity.handheld`opacity: .95`} height: 100%;
    }

    & ${StyleNavList}.show {
        display: flex;
        flex-direction: column;
    }
`;
