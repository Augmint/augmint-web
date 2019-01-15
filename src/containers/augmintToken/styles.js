import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";
import { remCalc } from "styles/theme";

import Header from "components/augmint-ui/header";
import { Pheader } from "components/PageLayout";
import { MyListGroup, MyListGroupRow as Row, MyListGroupColumn as Col } from "components/MyListGroups";

const baseStyle = `
  color: ${theme.colors.primary};
  padding-left: ${remCalc(45)};
  padding-right: ${remCalc(10)};
`;

export const StyledContainer = styled.div`
    background-color: ${theme.colors.white};
    color: ${theme.colors.primary};
    margin: ${remCalc(40)};
    padding-top: 15px;

    ${media.tablet`
        margin: 0;
    `};
`;

export const StyledHeader = styled(Header)`
    ${baseStyle};
    margin: 25px 10px 10px;
    background-color: ${theme.colors.opacExtraLighterGrey};
    line-height: ${remCalc(45)};
    padding-left: ${remCalc(35)};

    ${media.tablet`
        padding-left: 10px;
    `};
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

    ${media.tablet`
        padding-left: 20px;
        padding-right: 20px;
    `};
`;

export const StyledCol = styled(Col)`
    .center {
        text-align: center;
    }

    .alignLeft {
        text-align: left;
    }

    .collateralInEscrow {
        display: inline-block;
        font-size: ${remCalc(12)};
    }

    & > div.chart-info {
        background: black;
        content: "";
        display: inline-block;
        height: 10px;
        margin-left: 5px;
        width: 10px;

        &.blue {
            background-color: ${theme.chartColors.blue};
        }

        &.orange {
            background-color: ${theme.chartColors.orange};
        }

        &.red {
            background-color: ${theme.chartColors.red};
        }

        &.green {
            background-color: ${theme.chartColors.green};
        }
    }
    & > canvas {
        width: 100%;
        max-width: 350px;
        height: auto;
    }
`;

export const StyledRow = styled(Row)`
    & ${StyledCol} + ${StyledCol} {
        text-align: right;
    }

    &.borderTop {
        border-top: 1px solid ${theme.colors.grey};
    }

    &.result ${StyledCol} {
        font-size: ${remCalc(20)};
        font-weight: bold;
    }

    &.result.smaller ${StyledCol} {
        font-size: ${remCalc(18)};
    }
`;
