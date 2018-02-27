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
    padding: 0px;
    height: 325px;
    width: 150px;
    ${media.tablet`display: none;`}
`;

export const StyleStateHeader = styled.div`
    margin-bottom: 25px;
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
      margin-bottom: 65px;
      padding:0;
    `}

    & .list-item {
        padding-left: 30px;
        background: url(${bulletPoint}) no-repeat left 6px;
        background-size: 10px;
        margin: 0;
    }

    &:not(:first-child) ${StyleStateHeader} {
      margin-top: 25px;
    }
`;

export const StyleStateList = styled.div`
    position: absolute;
    right: 15%;
    top: 0;
    max-width: 275px;
    min-width: 275px;
    ${media.tablet`
      margin: auto;
      position: unset;
    `}
`;

export const StyleRoadmap = styled.div`
    margin: auto;
    margin-top: 75px;
    margin-bottom: 50px;
    padding: 0 20px;
    max-width: 1167px;

    &>div {
      ${media.tablet`margin: auto;`}
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
