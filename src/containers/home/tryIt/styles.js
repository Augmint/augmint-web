import styled from "styled-components";
import theme from "styles/theme";

import { media } from "styles/media";

export const MobileView = styled.div`
    display: none;
    visibility: hidden;
    ${media.tablet`
      display: block;
      visibility: visible;
    `};
`;

export const DesktopView = styled.div`
    ${media.tablet`
      display: none;
      visibility: hidden;
    `};
`;

export const StoreBadge = styled.img`
    max-height: 40px;
    min-height: 40px;
    padding: 0 6px;
    width: auto;
`;

export const StyledP = styled.p`
    color: ${theme.colors.white};    

    &.primaryColor {
        color: ${theme.colors.primary};
    }
`;
