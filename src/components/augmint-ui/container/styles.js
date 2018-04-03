import styled from "styled-components";
import { media } from "styles/media";

const BaseDiv = `
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: 1127px;
`;

export const StyledDiv = styled.div`
    ${BaseDiv};
    ${media.giant`
      max-width: 933px;
    `};
    ${media.desktop`
      max-width: 723px;
    `};
    ${media.tablet`
      margin-left: 1em;
      margin-right: 1em;
      max-width: 100%;
    `};
`;
