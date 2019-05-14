import styled from "styled-components";
import { Field } from "redux-form";

import theme from "styles/theme";
import { remCalc } from "styles/theme";

export const StyledField = styled(Field)`
    color: ${theme.colors.opacLightGrey};
    font-size: ${remCalc(16)} !important;
    font-weight: 200 !important;
    letter-spacing: 2.4px;
    line-height: ${remCalc(21)};
    min-width: 246px;
    height: 50px;
    max-width: 400px;
    margin: 0 auto;
    ::placeholder {
        color: gray !important;
        font-size: ${remCalc(16)} !important;
        font-weight: 200 !important;
    }
`;
