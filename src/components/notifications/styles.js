import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";

export const StyledNotificationPanel = styled.div`
    background: transparent;
    z-index: 100;
    position: fixed;
    top: 65px;
    right: 5px;
    width: 310px;
    /* min-width: 310px; */
    /* max-width: 366px; */
    /* padding: 40px 10px 10px; */
    max-height: calc(100% - 70px);
    overflow: scroll;

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
    /* border-radius: 5px 5px 0 0; */
    width: 310px;
    height: 40px;
    z-index: 1;
    /* text-align: center; */

    &.open {
        display: block;
        position: fixed;
        /* top: 0px;
        left: 0px; */
    }
`;

export const StyledWrapper = styled.div`
    display: block;
    margin: 5px 5px 10px;
    &.open {
        margin: 50px 10px 10px;
    }
`;

export const StyledSpan = styled.span`
    display: none;
    color: ${theme.colors.white};
    /* text-align: center; */

    &.open {
        display: block;
        position: absolute;
        top: 10px;
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
        top: 14px;
        right: 10px;
        cursor: pointer;
    }
`;
