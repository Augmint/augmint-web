import { css } from "styled-components";

export const theme = {
    breakpoints: {
        giant: 1285,
        desktop: 992,
        tablet: 768,
        mobile: 376
    }
};

export const media = Object.keys(theme.breakpoints).reduce((accumulator, label) => {
    const emSize = theme.breakpoints[label] / 16;
    accumulator[label] = (...args) => css`
        @media (max-width: ${emSize}em) {
            ${css(...args)};
        }
    `;

    const emSizeMin = (theme.breakpoints[label] + 1) / 16;
    accumulator[label + "Min"] = (...args) => css`
        @media (min-width: ${emSizeMin}em) {
            ${css(...args)};
        }
    `;
    return accumulator;
}, {});

export const mediaopacity = {
    handheld: (...args) => css`
        @media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
            ${css(...args)};
        }
    `
};
