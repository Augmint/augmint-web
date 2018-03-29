import styled from "styled-components";

const BaseIcon = `
    backface-visibility: hidden;
    display: inline-block;
    font-size: 1rem;
    font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    -webkit-backface-visibility: hidden;
    font-style: normal;
    font-weight: normal;
    height: 1em;
    margin: 0em 0.25rem 0em 0em;
    opacity: 1;
    speak: none;
    text-decoration: inherit;
    text-align: center;
    vertical-align: middle;
    width: 1.18em;

    &.disabled {
        opacity: 0.45 !important;
    }

    &.close {
        cursor: pointer;
        position: absolute;
        margin: 0em;
        top: 0.78575em;
        right: 0.5em;
        opacity: 0.7;
        -webkit-transition: opacity 0.1s ease;
        transition: opacity 0.1s ease;
    }

    &.close:hover {
        opacity: 1;
    }

    &.:before {
        background: none !important;
    }

    &:after,
    &:before {
        box-sizing: inherit;
    }
`;

export const StyledIcon = styled.i`
    ${BaseIcon};
`;
