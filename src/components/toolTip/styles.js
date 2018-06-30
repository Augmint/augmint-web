import styled from "styled-components";
import theme from "styles/theme";
import { remCalc } from "styles/theme";

import ReactTooltip from "react-tooltip";
import Header from "components/augmint-ui/header";

export const StyledToolTip = styled(ReactTooltip)`
    font-size: ${remCalc(12)};
    line-height: 1.2;

    &.customTheme {
        pointer-events: auto !important;
        max-width: 350px;

        &:hover {
            visibility: visible !important;
            opacity: 1 !important;
        }
    }
`;

export const StyledContent = styled.div`
    white-space: normal;
`;

export const StyledHeader = styled(Header)`
    font-weight: 500;
    margin: 10px 0;
`;
