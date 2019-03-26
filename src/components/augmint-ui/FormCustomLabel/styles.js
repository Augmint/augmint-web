import styled from "styled-components";
import theme from "styles/theme";

const BaseLabel = `
    background-color: ${theme.colors.lightGrey};
    color: rgba(0,0,0,.6);
    padding: 20px;
    white-space:nowrap;
`;

export const StyleLabel = styled.label`
    ${BaseLabel};
    border-radius: ${props =>
        props.align === "right" ? theme.borderRadius.right : props.align === "left" ? theme.borderRadius.left : ""};
`;
