import styled from "styled-components";
import { media } from "styles/media";
import theme from "styles/theme";

const BaseDiv = `
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: ${theme.pageSize.maxSize};
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
      margin-left: 1rem;
      margin-right: 1rem;
      max-width: 100%;
    `};
`;
