import styled from "styled-components";
import { default as theme, remCalc } from "styles/theme";

export const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    border-top: 1px solid ${theme.colors.opacGrey};
    border-bottom: 1px solid ${theme.colors.opacGrey};
    font-family: ${theme.typography.fontFamilies.currency};
    font-size: ${remCalc(14)};
    white-space: nowrap;

    thead th {
        padding-top: 20px;
        padding-bottom: 20px;
        text-transform: uppercase;
    }

    tbody tr:first-child > td {
        padding-top: 20px;
        border-top: 1px solid ${theme.colors.opacGrey};
    }
    tbody tr:last-child > td {
        padding-bottom: 20px;
        border-bottom: 1px solid ${theme.colors.opacGrey};
    }

    td,
    th {
        text-align: left;
        vertical-align: top;
        padding: 10px 20px;
    }
`;
