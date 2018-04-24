import styled from 'styled-components';
import theme from "styles/theme";

import { Link } from "react-router-dom";

import { BaseUl, BaseLi } from "components/augmint-ui/list";

const TOP_NAV_HEIGHT = '60px';

export const StyledTopNav = styled.nav`
    width: 100%;
    border-bottom: 1px solid ${theme.colors.primary};
    height: ${TOP_NAV_HEIGHT}
    position: fixed;
    background-color: ${theme.colors.white};
    z-index: 103;
    top: 0;
`;

export const StyledTopNavUl = BaseUl.extend`
    justify-content: flex-end;
`;

export const StyledTopNavLi = BaseLi.extend`
    height: ${TOP_NAV_HEIGHT};
`;

export const StyledTopNavLink = styled(Link)`
    display: flex;
    justify-content: center;
    align-items: center;
    height: ${TOP_NAV_HEIGHT};
    Width: ${TOP_NAV_HEIGHT};
    color: ${theme.colors.primary};
    
    > i {
        font-size: 24px;
        height: 24px;
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
