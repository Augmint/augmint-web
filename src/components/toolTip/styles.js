import styled from "styled-components";
import theme from "styles/theme";

import ReactTooltip from "react-tooltip";

export const StyledToolTip = styled(ReactTooltip)`
    font-size: 1rem;
    &.customeTheme {
        pointer-events: auto !important;

        overflow-wrap: break-word;

        &:hover {
            visibility: visible !important;
            opacity: 1 !important;
        }
    }
`;

export const StyledContent = styled.div`
    white-space: normal;
`;
