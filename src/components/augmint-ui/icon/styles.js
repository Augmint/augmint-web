import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";

export const StyledIcon = styled.i`
    text-align: center;

    &.disabled {
        opacity: 0.45;
    }

    &.close {
        cursor: pointer;
        position: absolute;
        margin: 0;
        top: 10px;
        right: 10px;
        opacity: 0.7;
        transition: opacity ${theme.transitions.fast};
    }

    &.close:hover {
        opacity: 1;
    }

    &.loading {
        animation: icon-loading 2s linear infinite;
    }

    &[color="grey"] {
        color: ${theme.colors.mediumGrey};
    }

    &.accountIcon {
        color: ${theme.colors.white};
        font-size: 1.5rem;
        height: 1.5rem;
        width: 1.5rem;
        padding-left: 14px;

        ${media.desktop`
            padding-left: 0;
        `};
    }
`;
