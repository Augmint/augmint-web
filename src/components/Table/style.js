import styled from "styled-components";
import { media } from "styles/media";

export const StyleTitle = styled.h3``;

export const StyleTable = styled.table`
    width: 100%;
    border-collapse: collapse;
`;

export const StyleThead = styled.thead``;
export const StyleTbody = styled.tbody`
    > tr:first-child > td {
        border-top: 1px solid #000;
    }
    > tr:last-child > td {
        border-bottom: 1px solid #000;
    }
`;
export const StyleTd = styled.td``;
export const StyleTh = styled.th``;

export const StyleTr = styled.tr`
    ${StyleTd}, ${StyleTh} {
        text-align: left;
        padding: 0.5em;
    }
    ${StyleTh} {
        text-transform: uppercase;
    }
`;
