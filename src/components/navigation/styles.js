import styled from 'styled-components';
import { ifProp } from 'styled-tools';

import { NavLink } from "react-router-dom";

export const StyleNavList = styled.ul`
    display: flex;
`;

export const StyleNavLink = styled(NavLink)`
    font-size: 13px;
    text-transform: uppercase;
    white-space: nowrap;
    color: ${ifProp('active', 'white', 'grey')};

    &:hover {
        color: white;
    }
`;

export const StyleNavItem = styled.li`
    display: flex;
    padding: 15px 5px;
    margin: 0 5px;
`;

export const StyledLogoContainer = styled.div`
    display: flex;
    justify-content: center;
`;
