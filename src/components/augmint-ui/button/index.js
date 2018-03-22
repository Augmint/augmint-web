import React from "react";

import {StyledLink, StyledA, StyledButton} from './styles';

export default function Button (props) {
    const { children, to, type } = props;

    let elementType = StyledA;

    if (type === 'submit') {
        elementType = StyledButton;
    } else if (to) {
        elementType = StyledLink;
    }

    return React.createElement(elementType, props, children);
}
