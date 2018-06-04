import React from "react";

import { StyledDiv } from "./styles";

export default function Segment(props) {
    const { children, className, loading } = props;

    let _className = className + " segment";

    if (loading) {
        _className += " loading";
    }

    return React.createElement(StyledDiv, { ...props, className: _className }, children);
}
