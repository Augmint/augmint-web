import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";
import empty from "assets/images/empty.svg";

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
    &[color="lightGray"] {
        color: ${theme.colors.lightGrey};
    }

    &.accountIcon {
        color: ${theme.colors.primary};
        font-size: 1.5rem;
        height: 1.5rem;
        width: 1.5rem;
        margin-top: 13px;

        ${media.tabletMin`
            margin-top: 3px;
        `}
    }

    &.empty {
        display: block;
        width: 4em;
        height: 4em;
        margin: 0 auto;
        background: url(${empty}) center center/100% 100% no-repeat;
    }
`;
