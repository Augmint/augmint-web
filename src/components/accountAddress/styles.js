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
`;

export const StyledContainer = styled.div`
    cursor: pointer;
    display: inline-block;
    font-weight: 700;

    &.clicked ${StyledClicked} {
        display: inline-block;
        padding-right: 5px;
    }

    &:hover ${StyledHint} {
        display: block;
    }

    &.clicked:hover ${StyledHint} {
        display: block;

        &::after {
            color: ${theme.colors.darkGreen};
            content: "Copied!";
        }
    }

    &.breakToLines {
        @media (max-width: 600px) {
            display: block;
            max-width: 260px;
        }
    }
`;
