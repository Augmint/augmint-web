import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import Header from "components/augmint-ui/header";

export const StyleTitle = styled(Header)`
    padding-left: 20px;
    padding-right: 20px;
`;

export const StyleTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    border-top: 1px solid ${theme.colors.opacGrey};
    border-bottom: 1px solid ${theme.colors.opacGrey};
    font-family: ${theme.typography.fontFamilies.currency};
    white-space: nowrap;
`;

export const StyleTd = styled.td`
    font-size: ${remCalc(14)};
`;

export const StyleTh = styled.th`
    font-size: ${remCalc(14)};
    font-weight: normal;
`;

export const StyleTr = styled.tr`
    ${StyleTd}, ${StyleTh} {
        text-align: left;
        vertical-align: top;
        padding: 10px 20px;
    }
    ${StyleTh} {
        text-transform: uppercase;
    }
    &:hover ${StyleTd} {
        background: ${theme.colors.white};
    }
`;

export const StyleThead = styled.thead`
    ${StyleTh} {
        padding-top: 20px;
        padding-bottom: 20px;
    }
`;
export const StyleTbody = styled.tbody`
    > ${StyleTr}:first-child > ${StyleTd} {
        padding-top: 20px;
        border-top: 1px solid ${theme.colors.opacGrey};
    }
    > ${StyleTr}:last-child > ${StyleTd} {
        padding-bottom: 20px;
        border-bottom: 1px solid ${theme.colors.opacGrey};
    }
`;
