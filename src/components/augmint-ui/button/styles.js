import styled from "styled-components";

import { Link } from "react-router-dom";

import theme from "styles/theme";

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
    font-size: 13px;
    letter-spacing: 2.6px;

    :hover {
        background-color: ${theme.colors.primary};
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
      -webkit-transition: all 0s linear,opacity .1s ease;
      -o-transition: all 0s linear,opacity .1s ease;
      transition: all 0s linear,opacity .1s ease;
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
