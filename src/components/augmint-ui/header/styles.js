import styled from "styled-components";
import theme from "styles/theme";

const BaseHeader = `
    color: ${theme.colors.white};
    font-family: ${theme.typography.fontFamilies.default};
    font-weight: 200;
    padding: 0;
`;

const HeaderH3 = `
    font-size: ${theme.typography.fontSizes.h3};
    line-height: ${theme.typography.fontSizes.h3};
    margin-bottom: 0.875rem;
`;

export const StyledHeaderH3 = styled.h3`
    ${BaseHeader};
`;
