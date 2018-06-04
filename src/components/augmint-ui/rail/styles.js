import styled from "styled-components";
import { media } from "styles/media";

export const StyledRail = styled.div`
    display: inline-block;
    margin-left: -300px;
    position: sticky;
    left: 0;
    top: 200px;
    width: 160px;
    z-index: 2;

    &.noSmallScreen {
        ${media.tablet`
          display: none;
        `};
    }
`;
