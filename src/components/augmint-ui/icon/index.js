import React from "react";

import { StyledIcon } from "./styles";

export default function Icon(props) {
    const { children, name } = props;
    let className = props.className;

    switch (name) {
        case "info":
            className += " fas fa-info";
            break;
        case "warning":
            className += " fas fa-exclamation-triangle";
            break;
        case "check":
            className += " fas fa-check";
            break;
        case "close":
            className += " fas fa-times";
            break;
        case "connect":
            className += " fas fa-plug";
            break;
        case "account":
            className += " far fa-id-card";
            break;
        case "exchange":
            className += " fas fa-exchange-alt";
            break;
        case "send":
            className += " fas fa-arrow-right";
            break;
        case "lock":
            className += " fas fa-lock";
            break;
        case "loan":
            className += " far fa-money-bill-alt";
            break;
        case "reserves":
            className += " fas fa-university";
            break;
        case "angle-right":
            className += " fas fa-angle-right";
            break;
        case "right chevron":
            className += " fas fa-angle-right";
            break;
        case "chevron-down":
            className += " fas fa-chevron-circle-down";
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
        case "copy":
            className += " far fa-copy";
            break;
        case "notifications":
            className += " far fa-bell";
            break;
        case "empty":
            className += " empty";
            break;
        case "plus":
            className += " fa fa-plus";
            break;
        case "arrow-down":
            className += " fa fa-arrow-down";
            break;
        default:
            break;
    }
    if (props.loading) {
        className += " loading fas fa-circle-notch";
    }

    return React.createElement(StyledIcon, { ...props, className: className }, children);
}
