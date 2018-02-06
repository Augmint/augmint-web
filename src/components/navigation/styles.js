import styled from 'styled-components';
import { ifProp } from 'styled-tools';

import { NavLink } from "react-router-dom";

import theme from '../../styles/theme';

export const StyleNavList = styled.ul`
    display: flex;
    padding: 0;
`;

export const StyleNavLink = styled(NavLink)`
    font-size: 13px;
    text-transform: uppercase;
    white-space: nowrap;
    color: ${ifProp('active', theme.colors.white, theme.colors.opacWhite)};

    transition: color ${theme.transitions.standard};

    &:hover {
        color: ${theme.colors.white};
    }
`;

export const StyleNavItem = styled.li`
    display: flex;
    padding: 15px 5px;
    
    & + li {
        margin-left: 8px;
    }
    `;
    
    export const StyledLogoContainer = styled.div`
    display: flex;
    justify-content: center;
    `;
    
    export const StyledNavContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: fixed;
    width: 100%;
    padding: 0 15px;
    z-index: 3;
    background-color: ${theme.colors.primary};
`

export const StyledLogo = styled.img`
    margin-top: 80px;
`;