import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

export const StyledMenu = styled.div`
    border-bottom: 1px solid ${theme.colors.white};
    color: ${theme.colors.white};
    display: flex;
    font-family: ${theme.typography.fontFamilies.default};
    font-size: ${remCalc(18)};
    font-weight: 400;
    line-height: ${remCalc(20)};
    margin-bottom: ${remCalc(14)};
    min-height: ${remCalc(50)};

    &.dashboardColor {
      border-bottom: 1px solid ${theme.colors.primary};
    }
`;

export const StyledMenuItem = styled.a`
    align-items: center;
    color: ${theme.colors.white};
    cursor: pointer;
    line-height: ${remCalc(18)};
    padding: ${remCalc(16)} ${remCalc(25)};

    &.active,
    &:hover {
      color: ${theme.colors.opacBlack};
    }

    &.active {
      background-color: ${theme.colors.white};
      border-radius: ${theme.borderRadius.top};
    }
}
`;

export const StyledMenuItemDashboard = styled.a`
    align-items: center;
    color: ${theme.colors.primary};
    cursor: pointer;
    line-height: ${remCalc(18)};
    padding: ${remCalc(16)} ${remCalc(25)};

    &.active,
    &:hover {
      color: ${theme.colors.secondary};
    }

    &.active {
      background-color: ${theme.colors.primary};
      border-radius: ${theme.borderRadius.top};
      color: ${theme.colors.white};
    }
}
`;
