import styled from "styled-components";
import theme from "styles/theme";

export const StyledContainer = styled.div`
    text-align: center;

    & input[type="radio"] {
        display: none;
    }

    & label {
        cursor: pointer;
    }

    & label > div {
        background-color: ${theme.colors.opacGrey};
        padding: 20px 10px;
        margin: 0 5px;
    }

    & input[type="radio"] + label div:hover,
    & input[type="radio"]:checked + label div {
        background-color: ${theme.colors.secondary};
        opacity: 1;
    }

    & input[type="radio"]:checked + label > div {
        border: 1px solid ${theme.colors.primary};
    }
`;
