import styled from "styled-components";

import { media } from "styles/media";
import Header from "components/augmint-ui/header";
import { remCalc } from "styles/theme";

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

export const StyledHeader = styled(Header)`
    ${media.mobile`
        font-size: ${remCalc(24)};
    `};
`;
