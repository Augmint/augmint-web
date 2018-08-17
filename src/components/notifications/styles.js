import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";

export const StyledNotificationPanel = styled.div`
    background: transparent;
    z-index: 100;
    position: fixed;
    top: 65px;
    right: 5px;
    width: 290px;
    /* max-width: 366px; */
    padding: 40px 10px 10px;
    height: calc(100% - 120px);

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

export const StyledSpan = styled.span`
    display: none;
    color: ${theme.colors.primary};
    text-align: center;

    &.opened {
        display: inline-block;
        position: absolute;
        top: 10px;
        left: 10px;
    }
`;

export const CloseIcon = styled.img`
    display: none;
    visibility: hidden;
    height: 24px;
    width: 24px;

    &.opened {
        display: inline-block;
        visibility: visible;
        position: absolute;
        top: 10px;
        right: 10px;
    }
`;
