import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

const BaseStyle = `
    color: ${theme.colors.opacWhite};
    display: flex;
    font-family: ${theme.typography.fontFamilies.default};
    font-size: ${remCalc(14)};
    justify-content: center;
    letter-spacing: 2.4px;
    margin: 0 ${remCalc(20)};
    text-align: center;
    text-transform: uppercase;

    &:hover {
      color: ${theme.colors.white};
    }

    & a {
      color: inherit;
    }
`;

export const StyledItem = styled.div`
    ${BaseStyle};
`;

export const StyledContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    margin: 0;
    padding: 0;
    text-align: center;
`;

export const StyledNoItems = styled.div`
    max-width: 660px;
    margin: 20px auto;
    padding: 20px;
    color: ${theme.colors.mediumGrey};
    text-align: center;
    font-family: ${theme.typography.fontFamilies.title};
`;
