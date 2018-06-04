import styled from "styled-components";
import theme from "styles/theme";

const BaseDiv = `
    border-top: 1px solid ${theme.colors.opacLightGrey};
    border-bottom: 1px solid ${theme.colors.opacLightWhite};
    margin: 1rem 0;
    height: 0;
    user-select: none;
`;

export const StyledDiv = styled.div`
    ${BaseDiv};
`;
