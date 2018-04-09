import styled from "styled-components";
import theme from "styles/theme";

const BaseLabel = `
    background-color: ${theme.colors.lightGray};
    color: rgba(0,0,0,.6);
    padding: 12px;
`;

export const StyleLabelRight = styled.label`
    ${BaseLabel};
    border-radius: 0 5px 5px 0;
`;
