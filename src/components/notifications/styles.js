import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";
// import { remCalc } from "styles/theme";

export const StyledNotificationPanel = styled.div`
    background: transparent;
    z-index: 100;
    position: fixed;
    top: 65px;
    right: 5px;
    width: 290px;
    /* max-width: 366px; */
    padding: 20px 10px;

    ${media.mobile`
        right: 0;
        left: 0;
        margin: auto;
    `} &.open {
        background: white;
        border: 1px solid ${theme.colors.primary};
        border-radius: 5px;
    }
`;
