import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

const BaseStyle = `
    display: block;
    font-family: ${theme.typography.fontFamilies.default};
    text-align: center;
    text-transform: uppercase;
`;

const BaseLabel = `
    color: ${theme.colors.secondary};
    font-size: ${remCalc(14)};
    font-weight: 700;
    line-height: ${remCalc(20)};
    `;

const BaseValue = `
    font-size: ${remCalc(42)};
    font-weight: 400;
    line-height: ${remCalc(42)};
    margin-top: 0;
    text-size-adjust: 100%;
`;

export const StyledLabel = styled.div`
    ${BaseStyle};
    ${BaseLabel};
`;

export const StyledValue = styled.div`
    ${BaseStyle};
    ${BaseValue};
`;

export const StyledContainer = styled.div`
    color: ${theme.colors.white};
    display: flex;
    flex-basis: auto;
    flex-direction: column;
    flex-grow: 0;
    flex-shrink: 1;
    font-family: ${theme.typography.fontFamilies.default};
    font-size: ${remCalc(14)};
    line-height: ${remCalc(20)};
    margin: 0 0 ${remCalc(28)};
    padding: ${remCalc(14)};
    text-align: center;
    text-size-adjust: 100%;
    min-width: 33.33%;
    min-width: calc(100% / 3);

    &.dashboard {
        color: ${theme.colors.primary};
    }
`;

export const StyledGroup = styled.div`
    align-items: flex-start;
    color: ${theme.colors.white};
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    font-family: ${theme.typography.fontFamilies.default};
    font-size: ${remCalc(14)};
    line-height: ${remCalc(20)};
    margin: 0 0 ${remCalc(-28)};
    text-align: center;
    text-size-adjust: 100%;

    &.centered {
        justify-content: space-around;
    }
`;
