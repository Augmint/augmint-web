import styled from "styled-components";
import theme from "styles/theme";

export const StyledContainer = styled.div`
    text-align: center;

    & input[type="radio"] {
        display: none;
    }

    & label div {
        background-color: ${theme.colors.secondary};
        opacity: 0.75;
        padding: 10px;
        margin: 0 5px;
    }

    & input[type="radio"]:checked + label div {
        opacity: 1;
    }
`;
