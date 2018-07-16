import styled from "styled-components";
import theme from "styles/theme";

export const TxDate = styled.span`
    font-size: 12px;
`;

export const TxTitle = styled.span`
    display: block;
    font-weight: bold;
`;

export const TxDetails = styled.span`
    font-size: 12px;
`;

export const TxPrice = styled.span`
    white-space: nowrap;
    &.minus {
        color: ${theme.colors.darkRed};
    }
    &.plus {
        color: ${theme.colors.darkGreen};
    }
`;
