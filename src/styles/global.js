import { injectGlobal } from "styled-components";
import { media } from "./media";

injectGlobal`
    @import url('https://fonts.googleapis.com/css?family=Roboto|Roboto+Mono|Roboto+Slab:300,400');

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
