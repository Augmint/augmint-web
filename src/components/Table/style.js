import styled from 'styled-components';
// import { media, mediaopacity } from '../../styles/media';

export const StyleTitle = styled.h3``;

export const StyleTable = styled.table`
  width: 100%;
`;

export const StyleThead = styled.thead``;
export const StyleTbody = styled.tbody``;
export const StyleTd = styled.td``;
export const StyleTh = styled.th``;

export const StyleTr = styled.tr`
  ${StyleTd},
  ${StyleTh} {
    text-align: left;
    padding: 0.5em;
  }
`;
