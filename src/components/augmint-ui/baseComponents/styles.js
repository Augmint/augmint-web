import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";
import { ifProp } from "styled-tools";

export const StyledContainer = styled.div`
    display: inline-flex;
    margin: 0 0 ${remCalc(16)};
    width: 100%;

    &.oneLine,
    &.oneLine input {
        width: auto;
    }

    & label,
    & input {
        font-size: ${remCalc(16)};
        font-weight: 400;
    }

    & label {
        line-height: ${remCalc(16)};
    }
`;

export const StyledInput = styled.input`
    border: 1px solid ${theme.colors.opacGrey};
    border-radius: ${theme.borderRadius.all};
    border-right: none;
    padding: ${remCalc(10)} ${remCalc(16)};
    width: 100%;
    
`;

export const StyledLabel = styled.label`
    font-size: ${remCalc(15)};
    font-weight: 700;
    line-height: ${remCalc(20)};
`;

export const StyledError = styled.span`
    color: ${theme.colors.darkRed};
`;

export const StyledFormField = styled.div`
    &.error {
        color: ${theme.colors.darkRed};

        & input {
            background-color: ${theme.colors.lightRed};
            border: 2px solid ${theme.colors.darkRed};
            color: ${theme.colors.darkRed};
        }
    }
`;
