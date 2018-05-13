import React from "react";

import { StyledDiv } from "./styles";

export default function Container(props) {
    const { children, text, className } = props;

    let _className = className;
    if (text) {
        _className += " text";
    }

    return React.createElement(StyledDiv, { ...props, className: _className }, children);
}
