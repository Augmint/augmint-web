import React from "react";

import {StyledLink, StyledA, StyledButton} from './styles';

export default function Button (props) {
    const { children, to } = props;

    const elementType = to ? StyledLink : StyledA || StyledButton;

    return React.createElement(elementType, props, children);
}