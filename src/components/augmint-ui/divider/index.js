import React from "react";

import { StyledDiv } from "./styles";

export default function Divider(props) {
    const { children } = props;

    return React.createElement(StyledDiv, props, children);
}
