import styled from "styled-components";

const BaseIcon = `
    height: 1em;
    text-align: center;
    width: 1.18em;

    &.disabled {
        opacity: .45;
    }

    &.close {
        cursor: pointer;
        position: absolute;
        margin: 0em;
        top: 10px;
        right: 10px;
        opacity: .7;
        transition: opacity 0.1s ease;
    }

    &.close:hover {
        opacity: 1;
    }

    &.loading {
        animation: icon-loading 2s linear infinite;
    }
`;

export const StyledIcon = styled.i`
    ${BaseIcon};
`;
