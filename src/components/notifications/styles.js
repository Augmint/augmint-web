import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";

export const StyledNotificationPanel = styled.div`
    background: transparent;
    z-index: 100;
    position: fixed;
    top: 65px;
    right: 11px;
    width: 310px;
    display: flex;
    flex-direction: column;
    max-height: calc(100% - 73px);
    padding-bottom: 3px;

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

export const StyledHead = styled.div`
    display: none;
    background: ${theme.colors.primary};
    width: 100%;
    height: 40px;
    z-index: 1;

    &.open {
        display: block;
    }
`;

export const StyledWrapper = styled.div`
    display: block;
    overflow: auto;
`;

export const StyledSpan = styled.span`
    display: none;
    color: ${theme.colors.white};

    &.open {
        display: block;
        position: absolute;
        top: 6px;
        left: 110px;
    }
`;

export const CloseIcon = styled.img`
    display: none;
    height: 16px;
    width: 16px;

    &.open {
        display: inline-block;
        position: absolute;
        top: 10px;
        right: 10px;
        cursor: pointer;
    }
`;
