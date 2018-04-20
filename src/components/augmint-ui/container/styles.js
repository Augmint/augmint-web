import styled from "styled-components";
import { media } from "styles/media";
import theme from "styles/theme";

const BaseDiv = `
    display: block;
    margin-left: auto;
    margin-right: auto;
    max-width: ${theme.pageSize.maxSize};

    &.text {
      font-size: 1.15rem;
      font-family: Lato,'Helvetica Neue',Arial,Helvetica,sans-serif;
      line-height: 1.5;
      max-width: 700px;
    }
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
