import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

import Header from "components/augmint-ui/header";
import { Pheader } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupColumn as Col } from "components/MyListGroups";

const baseStyle = `
  color: ${theme.colors.primary};
  padding-left: ${remCalc(45)};
`;

export const StyledContainer = styled.div`
    background-color: ${theme.colors.white};
    color: ${theme.colors.primary};
    margin: ${remCalc(40)};
`;

export const StyledHeader = styled(Header)`
    ${baseStyle};
    margin: 25px 10px;
    background-color: ${theme.colors.opacExtraLighterGrey};
    line-height: ${remCalc(45)};
    padding-left: ${remCalc(35)};
`;

export const StyledPheader = styled(Pheader)`
    ${baseStyle};
    font-size: ${theme.typography.fontSizes.h1};
    &.stabilityDashboard {
        padding: ${remCalc(45)};
        margin: 0;
    }
`;

export const StyledMyListGroup = styled(MyListGroup)`
    ${baseStyle};
`;

export const StyledCol = styled(Col)`
    .alignLeft {
        text-align: left;
    }

    .border {
        border-right: 1px solid ${theme.colors.black};
    }
`;

export const StyledRow = styled(Row)`
    & ${StyledCol} + ${StyledCol} {
        text-align: right;
    }

    &.borderTop {
        border-top: 1px solid ${theme.colors.black};
        margin: 15px 0;
        &.result ${StyledCol} {
            font-size: ${remCalc(20)};
            font-weight: bold;
        }
    }
`;
