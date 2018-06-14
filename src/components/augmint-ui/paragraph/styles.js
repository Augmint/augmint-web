import styled from "styled-components";
import theme from "styles/theme";

export const StyledP = styled.p`
    color: ${theme.colors.white};    

    &.primaryColor {
        color: ${theme.colors.primary};
    }
`;