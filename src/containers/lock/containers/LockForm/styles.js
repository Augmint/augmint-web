import styled from "styled-components";

import theme from "styles/theme";
import { media } from "../../../../styles/media";

export const TermTable = styled.table`
    background-color: transparent !important;
    margin-top: 0 !important;
    background-color: transparent;
    border-spacing: 0;
    margin-bottom: 16px;
    margin-top: 0;
    table-layout: fixed;
    width: 100%;
`;

export const TermTableBody = styled.tbody``;

export const TermTableRow = styled.tr``;

export const TermTableCell = styled.td`
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    color: ${theme.colors.primary};
    border-bottom: 1px solid ${theme.colors.opacExtraLighterGrey};
    padding: 0.8rem;

    &:first-child {
        width: 10px;
        padding-left: 0;
        ${media.phone`
            padding-right: .1rem;
        `};
    }

    ${media.phone`
        &:nth-child(3) {
            padding-right: .4rem;
        }
        &:nth-child(4) {
            padding-left: .4rem;
            padding-right: .2rem;
        }
        &:nth-child(5) {
            padding-left: 0;
            min-width: 50px;
        }
        &:last-child {
            padding-left: .2rem;
            padding-right: 0;
        }
    `};
`;

export const TermTableHeadCell = styled.th`
    background-color: transparent;
    color: ${theme.colors.primary};
    padding: 1rem;
    text-align: left;

    &:first-child {
        width: 10px;
        padding-left: 0;
        ${media.phone`
            padding-right: .1rem;
        `};
    }

    ${media.phone`
        &:nth-child(3) {
            padding-right: .4rem;
        }
        &:nth-child(4) {
            padding-left: .4rem;
            padding-right: .2rem;
        }
        &:nth-child(5) {
            padding-left: 0;
            padding-right: .2rem;
            width: 52px;
        }
        &:last-child {
            padding-left: .2rem;
            padding-right: 0;
        }
    `};
`;

export const TermTableHeader = styled.thead`
    background-color: transparent;
`;
