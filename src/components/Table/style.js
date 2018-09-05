import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";
import { media } from "styles/media";
import Header from "components/augmint-ui/header";

export const StyleTitle = styled(Header)`
    border-bottom: 1px solid ${theme.colors.opacGrey};
    padding: 0 20px 20px;
    margin: 0;

    ${media.tablet`
        padding-left: 0;
        padding-right: 0;
    `};
`;

export const StyleTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-family: ${theme.typography.fontFamilies.currency};
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
        padding: 10px 20px;

        ${media.tablet`
            padding-left: 0;
            padding-right: 0;
        `};
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
