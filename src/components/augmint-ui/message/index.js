import React from "react";

import { StyledDiv } from "./styles";
import { StyledIcon } from "../icon/styles";

export default function Message(props) {
    const { noCloseIcon, children } = props;
    if (noCloseIcon) {
        return React.createElement(StyledDiv, props, children);
    } else if (props.onDismiss) {
        return React.createElement(
            StyledDiv,
            props,
            React.createElement(StyledIcon, { className: "fas fa-times close", onClick: props.onDismiss }),
            children
        );
    } else {
        return React.createElement(StyledDiv, props, children);
    }
}
