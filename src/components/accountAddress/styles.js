import styled from "styled-components";
import theme from "styles/theme";

export const StyledClicked = styled.span`
    color: ${theme.colors.darkGreen};
    display: none;
`;

export const StyledHint = styled.span`
    -webkit-font-smoothing: antialiased;
    color: ${theme.colors.white};
    display: none;
    position: absolute;
    background-color: ${theme.colors.primary};
    font-weight: lighter;
    padding: 5px 10px;
    border-radius: 5px;

    &::after {
        content: "Click to copy!";
    }

    &.noHint {
        display: none;
    }
`;

export const StyledContainer = styled.div`
    cursor: pointer;
    display: inline-block;
    font-weight: 400;

    &.container {
        position: relative;
    }

    &.noClick {
        cursor: default;
    }

    &.showHint ${StyledClicked} {
        display: inline-block;
        padding-right: 5px;
    }

    &:hover ${StyledHint} {
        display: block;
    }

    &.showHint:hover ${StyledHint} {
        display: block;

        &::after {
            color: ${theme.colors.lightGreen};
            content: "Copied!";
        }
    }

    &.breakToLines {
        &.onMobile {
            @media (max-width: 600px) {
                display: block;
                max-width: 260px;
            }
        }
        &.always {
            display: block;
            max-width: 210px;
            margin: auto;
        }
    }

    &.bold {
        font-weight: 700;
    }

    &.font {
        font-family: ${theme.typography.fontFamilies.currency};
    }
`;

export const StyledHintBtn = styled.div`
    font-family: ${theme.typography.fontFamilies.default};
    display: none;

    &.showHint {
        display: block;
        background-color: white;
        border-radius: 3px;
        padding: 10px 20px;
        position: absolute;
        left: 45px;
        top: 42px;
    }
`;
