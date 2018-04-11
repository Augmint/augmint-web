import styled from "styled-components";
import theme from "styles/theme";

const BaseLabel = `
    background-color: ${theme.colors.lightGrey};
    color: rgba(0,0,0,.6);
    padding: 12px;
`;

export const StyleLabel = styled.label`
    ${BaseLabel};
    border-radius: ${props => (props.align === "right" ? "0 5px 5px 0" : "")};
`;
