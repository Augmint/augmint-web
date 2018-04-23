import styled from 'styled-components';
import theme from "styles/theme";

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

export const StyledTopNavLi = BaseLi.extend`
    height: ${TOP_NAV_HEIGHT};
`;

export const StyledTopNavLink = styled.a`
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
