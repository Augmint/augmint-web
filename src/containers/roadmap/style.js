import styled from 'styled-components';

export const StyleRoadmapLine = styled.img`
    padding: 0px 135px;
    max-width: 100%;
`;

export const StyleRoadmapState = styled.div`
    width:270px;
`;

export const StyleRoadmap = styled.div`
    margin: auto;
    margin-top: 75px;
    padding: 0 20px;
    max-width: 1167px;

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
    }

`;
