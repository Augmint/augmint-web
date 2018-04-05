import styled from "styled-components";

import theme from "styles/theme";

const BaseDiv = `
    background: ${theme.colors.messageBoxBackground};
    border-radius: 4px;
    color: ${theme.colors.messageBoxColor};
    font-size: 16px;
    font-smoothing: antialiased;
    min-height: 1em;
    margin: 1em 0em;
    padding: 1em 1.5em;
    position: relative;
    line-height: 20px;
    transition: opacity 0.1s ease, color 0.1s ease, background 0.1s ease, box-shadow 0.1s ease;
    box-shadow: 0px 0px 0px 1px rgba(34, 36, 38, 0.22) inset, 0px 0px 0px 0px rgba(0, 0, 0, 0);

    & p {
      opacity: .85;
    }

    &.error {
      background: ${theme.colors.messageBoxErrorBackground};
      color: ${theme.colors.messageBoxErrorColor};
    }
`;

export const StyledDiv = styled.div`
    ${BaseDiv};
`;
