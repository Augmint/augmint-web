import styled from "styled-components";

import { Link } from "react-router-dom";

import theme from "styles/theme";
import { remCalc } from "styles/theme";

const BaseButton = `
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.colors.white};
    color: ${theme.colors.primary};
    cursor: pointer;
    text-transform: uppercase;
    font-weight: 200;
    padding: 0 14px;
    border-radius: 4px;
    height: 42px;
    line-height: 42px;
    font-size: ${remCalc(13)};
    letter-spacing: 2.6px;

    &[disabled] {
      cursor: default;
      opacity: .45;
    }

    &:not([disabled]):hover {
        background-color: ${theme.colors.grey};
        color: ${theme.colors.white};
        box-shadow: 0 2px 14px rgba(0, 0, 0, 0.5);
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
`;

export const StyledLink = styled(Link)`
    ${BaseButton};
`;

export const StyledA = styled.a`
    ${BaseButton};
`;

export const StyledButton = styled.button`
    ${BaseButton};
`;
