import React from "react";

import { StyledHeaderH3 } from "./styles";

export default function Header(props) {
    const { children } = props;

    let elementType = StyledHeaderH3;

    return React.createElement(elementType, props, children);
}
