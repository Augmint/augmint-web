import styled from 'styled-components';

import { Link } from 'react-router-dom';

import theme from '../../styles/theme';

const BaseButton = `
    display: inline-flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.colors.white};
    color: ${theme.colors.primary};
    text-transform: uppercase;
    font-weight: 200;
    padding: 0 14px;
    border-radius: 4px;
    height: 42px;
    line-height: 42px;
    font-size: 13px;
    letter-spacing: 2.6px;

    :hover {
        color: ${theme.colors.primary};
        box-shadow: 0 2px 14px rgba(0, 0, 0, 0.5);        
    }
`;

export const StyledLink = styled(Link)`${BaseButton}`; 

export const StyledA = styled.a`${BaseButton}`;

export const StyledButton = styled.button`${BaseButton}`;
