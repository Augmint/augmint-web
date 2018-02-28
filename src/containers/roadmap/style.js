import styled from 'styled-components';
import { media, mediaopacity } from '../../styles/media';
import bulletPoint from '../../assets/images/bullet-point.svg';

export const StyleRoadmapTitle = styled.h1`
    font-size: 42px;
    text-align: center;
    margin-bottom: 80px;
`;

export const StyleStateTitle = styled.h2`
    margin-bottom: 25px;
`;

export const StyleRoadmapLine = styled.img`
    margin: 20px 0;
    padding: 0px;
    height: 250px;
    width: 150px;
    ${media.tablet`display: none;`}
`;

export const StyleStateHeader = styled.div`
    max-width: 275px;
    min-width: 275px;
    ${media.tablet`
      margin: auto;
    `}
`;

export const StyleRoadmapState = styled.div`
    position: relative;
    padding: 0  110px;
    ${media.tablet`
      margin: auto;
      padding:0;
    `}

    &>div.state {
      align-items: stretch;
      display: flex;
      justify-content: space-around;
      ${media.tablet`
        flex-direction: column;
      `}
    }

    & .list-item {
        padding-left: 30px;
        background: url(${bulletPoint}) no-repeat left 6px;
        background-size: 10px;
        margin: 0;
    }
`;

export const StyleStateList = styled.div`
    max-width: 275px;
    min-width: 275px;
    ${media.tablet`
      margin-top: 15px;
    `}
`;

export const StyleRoadmap = styled.div`
    margin: auto;
    margin-top: 75px;
    margin-bottom: 50px;
    padding: 0 20px;
    max-width: 1167px;
    ${media.tablet`
      margin-bottom: 0;
    `}

    &>div + div {
      ${media.tablet`
        margin-top: 65px;
      `}
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
      margin: 0;
      margin-bottom: 10px;
    }
`;
