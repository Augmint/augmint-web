import React from "react";

import { StyledIcon } from "./styles";

export default function Icon(props) {
    const { children } = props;

    return React.createElement(StyledIcon, props, children);
}
