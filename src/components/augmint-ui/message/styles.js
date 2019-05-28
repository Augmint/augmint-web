import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

const BaseDiv = `
    background: ${theme.colors.lightCyan};
    border-radius: 4px;
    color: ${theme.colors.darkCyan};
    font-size: 16px;
    font-smoothing: antialiased;
    min-height: 1em;
    margin: .2em 0em;
    padding: .8em;
    position: relative;
    line-height: 20px;
    transition: opacity 0.1s ease, color 0.1s ease, background 0.1s ease, box-shadow 0.1s ease;
    box-shadow: 0px 0px 0px 1px rgba(34, 36, 38, 0.22) inset, 0px 0px 0px 0px rgba(0, 0, 0, 0);

    &.notification {
      width: 260px;
    }

    & .notification-header-cont {
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
    }

    & .notification-header-cont i {
      width: 16px;
      height: 16px;
      margin-top: 2px;
    }

    & .notification-header-cont h4 {
      margin-left: .6em;
    }

    & h4 {
      font-size: ${remCalc(18)};
      margin: 0 0 .6em;

      i {
        margin-right: 8px;
      }
    }

    & p {
      opacity: .85;
      font-size: ${remCalc(14)};
      line-height: ${remCalc(16)};
      margin: 0;
      & .small {
        font-size: ${remCalc(10)}
        line-height: ${remCalc(12)};
      }
    }

    &.notification p.nonce {
      margin-left: 30px;
      padding-bottom: 0.6em;
    }

    &.notification div p {
      margin-left: 30px;

      & small {
        display: block;
        margin-top: 5px;
      }
    }

    &.error {
      background: ${theme.colors.lightRed};
      color: ${theme.colors.darkRed};
    }

    &.success {
      background: ${theme.colors.lightGreen};
      color: ${theme.colors.darkGreen};
    }
`;

export const StyledDiv = styled.div`
    ${BaseDiv};
`;
