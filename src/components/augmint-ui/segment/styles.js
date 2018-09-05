import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";
import { remCalc } from "styles/theme";

const BaseDiv = `
  background: none transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  font-size: 1rem;
  margin: 1rem 0;
  padding: 0;
  position: relative;

  &:first-child {
    margin-top: 0;
  }

  &.block {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  &.vertical {
    text-align: center;
  }

  &.loading {
    position: relative;
    cursor: default;
    pointer-events: none;
    text-shadow: none!important;
    color: transparent!important;
    -webkit-transition: all 0s linear;
    -o-transition: all 0s linear;
    transition: all 0s linear;
  }

  &.loading:before {
    position: absolute;
    content: '';
    top: 0;
    left: 0;
    background: ${theme.colors.opacWhite};
    width: 100%;
    height: 100%;
    border-radius: ${remCalc(4)};
    z-index: 100;
  }

  &.loading:after {
    position: absolute;
    content: '';
    top: 50%;
    left: 50%;
    margin: -1.5rem 0 0 -1.5rem;
    width: 3rem;
    height: 3rem;
    animation: icon-loading .6s linear;
    animation-iteration-count: infinite;
    border-radius: 500rem;
    border-color: ${theme.colors.mediumGrey} ${theme.colors.lightGrey} ${theme.colors.lightGrey} ${
    theme.colors.lightGrey
};
    border-style: solid;
    border-width: .2rem;
    box-shadow: 0 0 0 1px transparent;
    visibility: visible;
    z-index: 101;
  }
`;

export const StyledDiv = styled.div`
    ${BaseDiv};
    ${media.tablet`
        margin-left: -1rem;
        margin-right: -1rem;
        
        &.block {
            margin-left: 0;
            margin-right: 0;
        }
    `};
`;
