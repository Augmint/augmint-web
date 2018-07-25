import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";
import { Pblock } from "components/PageLayout";
import { remCalc } from "styles/theme";
import { Link } from "react-router-dom";

export const StyledAccountDiv = styled.div`
    font-weight: bolder;

    &.accInfoDetail {
        display: none;
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
            color: ${theme.colors.white};
            font-size: ${remCalc(20)};
            line-height: 26px;
            margin-bottom: 8px;
            margin-top: 0;
        }
    `};
`;

export const StyledAccountInfo = styled(Pblock)`
    &.accountInfo {
        padding: 20px 10px;
        border: 1px solid ${theme.colors.secondary};
        border-radius: 0px 0px 5px 5px;
        ${media.tablet`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${theme.colors.secondary};
            opacity: .97;
            padding: 0;
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
        margin-top: 0;
        color: ${theme.colors.primary};
        font-size: ${remCalc(20)};
        font-weight: bolder;
        line-height: 26px;
        &:hover {
            color: ${theme.colors.white};
        }

        & > i {
            padding-right: 10px;
        }
    `};
`;
