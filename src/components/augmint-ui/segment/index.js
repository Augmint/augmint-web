import React from "react";

import { StyledDiv } from "./styles";

export default function Segment(props) {
    const { children, className } = props;

    let _className = className + " segment";

    return React.createElement(StyledDiv, { ...props, className: _className }, children);
}
