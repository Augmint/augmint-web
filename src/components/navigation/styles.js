import styled from "styled-components";
import { ifProp } from "styled-tools";

import { NavLink } from "react-router-dom";

import theme from "styles/theme";
import { media, mediaopacity } from "styles/media";

const breakpoint = media.desktop;

export const StyleNavList = styled.ul`
    display: flex;
    padding: 0;
    margin: 0;
    ${breakpoint`
      margin-top: 135px;
      display: none;
      position: absolute;
      left: 0;
      right: 0;
    `};
    & .segment {
        display: none;
    }
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
    ${breakpoint`
      text-align: center;

    `} & + li {
        margin-left: 8px;
        ${breakpoint`
          margin-left: 0px;
        `};
    }

    & a {
        padding: 15px 5px;
        width: 100%;
        ${breakpoint`
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
    ${breakpoint`
      max-height: 200px;
    `};
`;

export const StyledNavLeftSide = styled.div`
    display: flex;

    & img.augmint {
        max-height: 50px;
        padding-right: 10px;
        ${breakpoint`
          display: none;
        `};
    }
`;

export const StyledNavRightSide = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    width: auto;

    ${breakpoint`
    & a:first-child {
      display: none
    }
  `}
`;

export const StyledLogo = styled.img`
    margin-top: 80px;
    object-fit: contain;
`;

export const HamburgerMenu = styled.img`
    display: none;
    height: 32px;
    width: 32px;
    visibility: hidden;
    ${mediaopacity.handheld`opacity: .8`} ${breakpoint`
      display: block;
      visibility: visible;
    `};
`;

export const StyledNavContainer = styled.div`
    align-items: flex-start;
    background-color: ${theme.colors.primary};
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    padding: 15px;
    position: fixed;
    width: 100%;
    z-index: 3;

    &.opened {
        ${mediaopacity.handheld`opacity: .95`} height: 100%;
    }

    & ${StyleNavList}.show {
        display: flex;
        flex-direction: column;

        & .segment {
            display: block;
        }
    }
`;
