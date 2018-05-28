import React from "react";

import { StyledIcon } from "./styles";

export default function Icon(props) {
    const { children, name } = props;
    let className = props.className;

    switch (name) {
        case "info":
            className += " fas fa-info";
            break;
        case "check":
            className += " fas fa-check";
            break;
        case "close":
            className += " fas fa-times";
            break;
        case "angle-right":
            className += " fas fa-angle-right";
            break;
        case "right chevron":
            className += " fas fa-angle-right";
            break;
        case "trash":
            className += " fas fa-trash-alt";
            break;
        case "zoom":
            className += " fas fa-search-plus";
            break;
        case "help circle":
            className += " fas fa-question-circle";
            break;
        case "question":
            className += " fas fa-question";
            break;
        case "github":
            className += " fab fa-github";
            break;
        default:
            break;
    }
    if (props.loading) {
        className += " loading fas fa-circle-notch";
    }

    return React.createElement(StyledIcon, { ...props, className: className }, children);
}
