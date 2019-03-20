import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";
import { media } from "styles/media";

const BaseModal = `
    background-color: ${theme.colors.white};
    border-radius: ${theme.borderRadius.all};
    color: ${theme.colors.primary};
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 720px;
`;

export const StyledModal = styled.div`
    ${BaseModal};
    ${media.desktop`
        width: 680px;
    `};
    ${media.tablet`
        width: 75%;
    `};
    ${media.mobile`
        width: 85%;
        height: 60%;
    `};

    &.disclaimer-modal {
        display: flex;
        flex-direction: column;

        ${media.tablet`
            max-height: 70%;
        `};
    }
`;

export const StyledOverlay = styled.div`
    background-color: ${theme.colors.opacLightGrey};
    bottom: 0;
    left: 0;
    position: fixed;
    right: 0;
    top: 0;
    z-index: 1000;
`;

export const StyledModalContent = styled.div`
    display: block;
    font-size: ${remCalc(14)};
    line-height: 1.4;
    padding: ${remCalc(21)};

    &.disclaimer-modal {
        display: flex;
        flex-direction: column;
    }
`;

export const StyledModalActions = styled.div`
    border-top: 1px solid ${theme.colors.opacGrey};
    padding: ${remCalc(14)};
    text-align: right;
`;

export const StyledCloseButton = styled.button`
    all: unset;
    color: ${theme.colors.white};
    cursor: pointer;
    font-size: ${remCalc(25)};
    position: absolute;
    top: -25px;
    right: -25px;
`;
