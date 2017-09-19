import React from "react";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";

export function GitterButton(props) {
    const {
        content = "Ask for help on our gitter channel",
        icon = "chat",
        labelPosition = "left",
        size = "large",
        target = "_blank",
        primary = true,
        ...other
    } = props;
    return (
        <Button
            as={Link}
            to="https://gitter.im/digital-credit-money/Lobby?utm_source=GitterButton&utm_medium=web&utm_campaign=init"
            icon={icon}
            labelPosition={labelPosition}
            content={content}
            target={target}
            size={size}
            primary={primary}
            {...other}
        />
    );
}
