import styled from "styled-components";
import { Link } from "react-router-dom";
import { default as theme, remCalc } from "styles/theme";
import { media } from "styles/media";

const BaseButton = styledComponent => styledComponent`
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.colors.white};
    color: ${theme.colors.primary};
    cursor: pointer;
    text-transform: uppercase;
    font-weight: 200;
    margin: 0;
    padding: 0 14px;
    border-radius: 4px;
    height: 42px;
    line-height: 42px;
    font-size: 13px;
    letter-spacing: normal;
    
    & + & {
      margin-left: 1em;
    }

    &:hover {
      background-color: ${theme.colors.grey};
      color: ${theme.colors.white};
      box-shadow: 0 2px 14px rgba(0, 0, 0, 0.2);
    }

    &[disabled] {
      color: ${theme.colors.primary};
      cursor: default;
      opacity: .45;
      pointer-events: none;
    }

    &.hideIfDisables[disabled] {
      visibility: hidden;
    }

    &.dashboardColors {
      background-color: ${theme.colors.secondary};

      &:hover,
      &:focus {
        background-color: ${theme.colors.secondaryDark};
      }
    }

    &.primary {
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};

      ${media.tabletMin`
        padding: 8px 30px;
        font-size: ${remCalc(16)};
      `};
    }

    &.grey {
      background-color: ${theme.colors.grey};
    }

    &.loading {
      position: relative;
      cursor: default;
      text-shadow: none!important;
      color: transparent!important;
      opacity: 1;
      pointer-events: auto;
    }

    &.loading:after,
    &.loading:before {
      position: absolute;
      content: "";
      border-radius: 50%;
      top: 50%;
      left: 50%;
      margin: -9px 0 0 -9px;
      width: 18px;
      height: 18px;
    }

    &.loading:before {
      border: 3px solid rgba(0,0,0,.15);
    }

    &.loading:after {
      animation: button-spin .6s linear;
      animation-iteration-count: infinite;
      border-color: #fff transparent transparent;
      border-style: solid;
      border-width: 3px;
      box-shadow: 0 0 0 1px transparent;
    }

    &[icon] {
      color: ${theme.colors.opacLighterGrey};
      position: relative;
    }

    &[icon]:hover {
      background-color: white;
      color: ${theme.colors.opacLightGrey};
    }

    &[icon][labelposition="right"] {
      padding-right: 60px;
    }

    &[icon] i {
      position: absolute;
      height: 100%;
      margin: 0;
      width: 3rem;
      background-color: ${theme.colors.opacExtraLighterGrey};
      top: 0;
      left: 0;
    }

    &[icon] i:before {
      display: block;
      font-size: 25px
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      text-align: center;
      width: 100%;
    }

    &[labelposition="right"] i {
      left: auto;
      right: 0;
      border-radius: 0;
      border-top-right-radius: inherit;
      border-bottom-right-radius: inherit;
    }
`;

export const StyledLink = BaseButton(styled(Link));

export const StyledA = BaseButton(styled.a);

export const StyledButton = BaseButton(styled.button);
