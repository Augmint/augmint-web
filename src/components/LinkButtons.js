import React from "react";
import Button from "./augmint-ui/button";

import discordSVG from "assets/images/Discord-Logo.svg";

export function DiscordButton(props) {
    return (
        <Button className="discord" href="https://discord.gg/PwDmsnu" target="_blank">
            <img
                alt="discord icon"
                src={discordSVG}
                style={{ display: "inline-block", marginRight: 20, maxWidth: 40 }}
            />
            Ask for help on our Discord
        </Button>
    );
}
