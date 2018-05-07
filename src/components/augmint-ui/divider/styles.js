import styled from "styled-components";
import theme from "styles/theme";

const BaseDiv = `
    border-top: 1px solid rgba(34,36,38,.15);
    border-bottom: 1px solid rgba(255,255,255,.1);
    margin: 1rem 0;
    height: 0;
    user-select: none;
`;

export const StyledDiv = styled.div`
    ${BaseDiv};
`;
