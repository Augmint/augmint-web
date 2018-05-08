import React from "react";

import { StyledIframe } from "./styles";

export default function Video(props) {
    return React.createElement(StyledIframe, {
        frameBorder: 0,
        allow: "autoplay; encrypted-media",
        allowFullScreen: true,
        width: "100%",
        height: "100%",
        ...props
    });
}
