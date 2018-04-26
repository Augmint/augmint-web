import styled from "styled-components";
import theme from "styles/theme";

const BaseHeader = `
    color: ${theme.colors.white};
    font-family: MaisonNeue,'Helvetica Neue',Arial,Helvetica,sans-serif;
    font-weight: 200;
    padding: 0;
`;

const HeaderH3 = `
    font-size: 26px;
    line-height: 26px;
    margin-bottom: 14px;
`;

export const StyledHeaderH3 = styled.h3`
    ${BaseHeader};
`;
