import styled from 'styled-components';

import { Table } from 'semantic-ui-react'

import theme from '../../../../styles/theme';

export const TermTable = styled(Table)`
    background-color: transparent!important;
    margin-top: 0!important;
`;

export const TermTableBody = styled(Table.Body)`
`;
    
export const TermTableRow = styled(Table.Row)`
`;

export const TermTableCell = styled(Table.Cell)`
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    color: ${theme.colors.white};
    
    &:first-child {
        width: 40px;
    }
    `;
    
    export const TermTableHeadCell = styled(Table.HeaderCell)`
    background-color: transparent!important;
    color: ${theme.colors.white}!important;

    &:first-child {
        width: 40px;
    }
`;

export const TermTableHeader = styled(Table.Header)`
    background-color: transparent;
`;