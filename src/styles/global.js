import { injectGlobal } from "styled-components";
import { media } from "./media";

injectGlobal`
    @font-face {
        font-family: 'MaisonNeue';
        src: local('MaisonNeue'), url(fonts/MaisonNeue-Book.woff) format('woff');
        src: local('MaisonNeue'), url(fonts/MaisonNeue-Book.woff2) format('woff2');
    }

    @keyframes icon-loading {
        0% {
            transform: rotate(0);
        }

        100% {
            transform: rotate(360deg);
        }
    }

    .hide-xs {
        ${media.tablet`
            display: none;
        `}
    }

    .show-xs {
        ${media.tabletMin`
            display: none;
        `}
    }
`;
