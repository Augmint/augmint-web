import styled from "styled-components";
import theme from "styles/theme";

const BaseHeader = `
    color: ${theme.colors.white};
`;

export const StyledHeaderH3 = styled.h3`
    ${BaseHeader};
`;

export const StyledHeaderH2 = styled.h2`
    ${BaseHeader};
`;

export const StyledHeaderH4 = styled.h4`
    ${BaseHeader};
`;
