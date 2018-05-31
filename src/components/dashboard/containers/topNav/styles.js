import styled from 'styled-components';
import theme from "styles/theme";

import { Link } from "react-router-dom";

const TOP_NAV_HEIGHT = '60px';

export const StyledTopNav = styled.nav`
    display: flex;
    justify-content: space-between;
    width: 100%;
    border-bottom: 1px solid #ccc;
    height: ${TOP_NAV_HEIGHT}
    position: absolute;
    background-color: ${theme.colors.white};
    z-index: 103;
    top: 0;
`;

export const TitleWrapper = styled.div`
    margin-left: 200px;
    max-width: 60%;

    h1.ui.header {
        color: ${theme.colors.secondary};
    }
`;

export const StyledTopNavUl = styled.ul`
    display: flex;
    justify-content: flex-end;
    margin: 0;
`;

export const StyledTopNavLi = styled.li`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${TOP_NAV_HEIGHT};
`;

export const StyledTopNavLink = styled(Link)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${TOP_NAV_HEIGHT};
    Width: ${TOP_NAV_HEIGHT};
    color: ${theme.colors.primary};
    transition: all ${theme.transitions.fast};
    transition-property: background-color, color;
    
    > i {
        font-size: 1.5rem;
        height: 1.5rem;
        width: 1.5rem;
    }

    &:hover {
        background-color: ${theme.colors.secondary};
        color: ${theme.colors.white};
    }
    `;
    
    export const StyledTopNavLinkRight = StyledTopNavLink.extend`
    display: flex;
    flex-direction: column;
    font-size: 11px;
    `;
    
    export const StyledPrice = styled.span`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    color: ${theme.colors.primary};
    padding: 0 20px;
    
    > .price {
        font-size: 1.125rem;
        color: ${theme.colors.secondary};
    }

    > .last-update {
        font-size: 0.75rem;
    }
`;
