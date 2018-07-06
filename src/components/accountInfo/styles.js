import styled from "styled-components";
import theme from "styles/theme";
import { media } from "styles/media";
import { Pblock } from "components/PageLayout";

export const StyledAccountP = styled.p`
    font-weight: bolder;

    &.accInfoDetail {
        display: none;
    }

    ${media.tablet`
        color: ${theme.colors.primary};
        font-size: 20px;
        line-height: 26px;
        &.accInfoDetail {
            display: block;
        }

        &.accInfoDetail > i {
            padding-right: 10px;
        }

        > p {            
            margin-bottom: 8px;
            margin-top: 0;
            color: ${theme.colors.white};
            font-size: 20px;
            line-height: 26px;
        }
    `};
`;

export const StyledAccountInfo = styled(Pblock)`
    &.accountInfo {
        padding: 0px 10px;
        border: 1px solid #ffad00;
        border-radius: 0px 0px 5px 5px;
        ${media.tablet`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${theme.colors.secondary};
            opacity: .95;
            padding: 0;
        `};
    }

    ${media.tablet`
        ${StyledAccountP}:first-of-type{
            margin-top: 80px;
        }
    `};
`;
