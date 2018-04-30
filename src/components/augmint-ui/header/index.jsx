import React from "react";

import { StyledHeaderH4, StyledHeaderH3, StyledHeaderH2 } from "./styles";

export default function Header(props) {
    const { as, children, content } = props;

    let elementType = StyledHeaderH3;

    if (as === "h2") {
        elementType = StyledHeaderH2;
    }

    if (as === "h4") {
        elementType = StyledHeaderH4;
    }

    return React.createElement(elementType, props, children, content);
}
