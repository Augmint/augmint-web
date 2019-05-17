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
    margin: auto;
    ${media.desktop`
      max-width: 933px;
    `};
    ${media.tablet`
      &.homePage {
        max-width: 60%;
        &.wider {
            max-width: 85%;
          }
      }
    `};
    ${media.mobile`
      &.homePage {
        max-width: 90%;
        &.wider {
          max-width: 98%;
        }
      }
    `};
`;
