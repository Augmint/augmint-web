import styled from "styled-components";
import theme from "styles/theme";

export const StyledClicked = styled.span`
    color: ${theme.colors.darkGreen};
    display: none;
`;

export const StyledHint = styled.span`
    display: none;
    position: absolute;
    background-color: ${theme.colors.lightGreen};
    padding: 5px;
    border-radius: 5px;

    &::after {
        content: "Click to copy!";
    }
`;

export const StyledContainer = styled.div`
    cursor: pointer;
    display: inline-block;

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
`;
