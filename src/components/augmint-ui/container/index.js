import React from "react";

import { StyledDiv } from "./styles";

export default function Container(props) {
    const { children } = props;

    return React.createElement(StyledDiv, props, children);
}
