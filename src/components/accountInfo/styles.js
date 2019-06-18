import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";
import { Pblock } from "components/PageLayout";
import { remCalc } from "styles/theme";
import { Link } from "react-router-dom";

export const StyledAccountDiv = styled.div`
    &.accInfoDetail {
        display: none;
        margin-top: 20px;
    }

    > div {
        font-size: ${remCalc(16)};
        font-weight: 700;
        line-height: ${remCalc(18)};
        margin-top: 0;

        .symbol {
            font-weight: 400;
        }
    }

    ${media.tablet`
        color: ${theme.colors.primary};
        font-size: ${remCalc(20)};
        line-height: 26px;
        &.accInfoDetail {
            display: block;
        }

        &.accInfoDetail > i {
            padding-right: 10px;
        }

        > div {
            font-size: ${remCalc(20)};
            line-height: ${remCalc(24)};
        }
    `};

    ${media.mobile`
        > div {
            font-size: ${remCalc(20)};
            line-height: ${remCalc(24)};
        }
    `}
`;

export const StyledAccountInfo = styled(Pblock)`
    &.accountInfo {
        padding: 20px 10px;
        border: 1px solid ${theme.colors.secondary};
        border-radius: 0px 0px 5px 5px !important;
        ${media.tablet`
            position: fixed;
            top: 0;
            left: 0px;
            width: 100%;
            height: 100%;
            background: ${theme.colors.secondary};
            opacity: .97;
            padding: 0;
            z-index: 1;
        `};
    }

    ${media.tablet`
        ${StyledAccountDiv}:first-of-type{
            margin-top: 80px;
        }
    `};
`;

export const StyledAccInfoLink = styled(Link)`
    display: none;
    ${media.tablet`
        display: block;
        margin-bottom: 8px;
        margin-top: 20px;
        color: ${theme.colors.primary};
        font-size: ${remCalc(20)};
        text-decoration: underline;
        line-height: 26px;
        &:hover {
            color: ${theme.colors.white};
            text-decoration: underline;
        }

        & > i {
            padding-right: 10px;
        }
    `};
`;
