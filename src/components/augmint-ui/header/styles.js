import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

const BaseHeader = `
    color: ${theme.colors.white};
    font-family: ${theme.typography.fontFamilies.default};
    font-weight: 200;
    padding: 0;

    &.opacLightGrey {
      color: ${theme.colors.opacLightGrey}
    }
    & i {
      margin: 0 10px;
    }
`;

const HeaderH5 = `
    font-size: ${theme.typography.fontSizes.h5};
    line-height: ${remCalc(15)};
`;

const HeaderH4 = `
    font-size: ${theme.typography.fontSizes.h4};
    line-height: ${theme.typography.fontSizes.h4};
    margin-bottom: ${remCalc(14)};
`;

const HeaderH3 = `
    font-size: ${theme.typography.fontSizes.h3};
    line-height: ${theme.typography.fontSizes.h3};
    margin-bottom: 0.875rem;
`;

const HeaderH2 = `
    font-size: ${theme.typography.fontSizes.h2};
    line-height: ${theme.typography.fontSizes.h2};
    margin-bottom: ${remCalc(50)};
`;

const HeaderH1 = `
    font-size: ${theme.typography.fontSizes.h1};
    line-height: ${theme.typography.fontSizes.h1};
    margin-bottom: ${remCalc(14)};
`;

export const StyledHeaderH1 = styled.h1`
    ${BaseHeader};
    ${HeaderH1};
`;

export const StyledHeaderH2 = styled.h2`
    ${BaseHeader};
    ${HeaderH2};
`;

export const StyledHeaderH3 = styled.h3`
    ${BaseHeader};
    ${HeaderH3};
`;

export const StyledHeaderH4 = styled.h4`
    ${BaseHeader};
    ${HeaderH4};
`;

export const StyledHeaderH5 = styled.h5`
    ${BaseHeader};
    ${HeaderH5};
`;
