import styled from 'styled-components';
import { media, mediaopacity } from '../../styles/media';

export const StyleRoadmapLine = styled.img`
    padding: 0px 135px;
    max-width: 100%;
    ${media.tablet`display: none;`}
`;

export const StyleRoadmapState = styled.div`
    width:270px;
    ${media.tablet`
      margin: auto;
      margin-bottom: 65px;
    `}
`;

export const StyleRoadmap = styled.div`
    margin: auto;
    margin-top: 75px;
    padding: 0 20px;
    max-width: 1167px;

    &>div {
      ${media.tablet`margin: auto;`}
    }

    &>div:nth-child(odd) ${StyleRoadmapLine} {
      -moz-transform: scaleX(-1);
      -o-transform: scaleX(-1);
      -webkit-transform: scaleX(-1);
      transform: scaleX(-1);
      filter: FlipH;
      -ms-filter: "FlipH";
    }

    &>div:nth-child(odd) ${StyleRoadmapState} {
      float: right;
      ${media.tablet`float: none;`}
    }

    & h4:not(.state),
    h5,
    p {
      margin-top: 0;
      ${mediaopacity.handheld`opacity: .6`}
    }

    & h4 {
      margin: 0;
    }

    & h4.state {
      margin-bottom: 14px;
    }

    & p {
      font-size: 15px;
      margin: 0;
      margin-bottom: 5px;
    }
`;
