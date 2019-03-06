import React from "react";

import { StyledDiv } from "./styles";
import { StyledIcon } from "../icon/styles";

export default function Message(props) {
    const { children, onDismiss } = props;
    let divProps = Object.assign({}, props);
    delete divProps.onDismiss;

    if (props.onDismiss) {
        return React.createElement(
            StyledDiv,
            divProps,
            React.createElement(StyledIcon, {
                className: "fas fa-times close",
                "data-testid": "msgPanelClose",
                onClick: onDismiss
            }),
            children
        );
    } else {
        return React.createElement(StyledDiv, divProps, children);
    }
}
