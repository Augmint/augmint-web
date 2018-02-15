import React from "react";
import { Link } from "react-router-dom";
import { Button } from "semantic-ui-react";

export function DiscordButton(props) {
    const {
        content = "Ask for help on our Discord",
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
            to="https://discordapp.com/invite/PwDmsnu"
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
