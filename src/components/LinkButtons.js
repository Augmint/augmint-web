import React from "react";
import Button from "components/augmint-ui/button";

import theme from "styles/theme";
import { remCalc } from "styles/theme";

import discordSVG from "assets/images/Discord-Logo.svg";

const style = {
    all: "initial",
    color: theme.colors.secondary,
    cursor: "pointer",
    fontFamily: theme.typography.fontFamilies.default,
    display: "flex",
    fontSize: remCalc(18),
    justifyContent: "center",
    alignItems: "center",
    margin: 0,
    padding: 0
};

export function DiscordButton(props) {
    return (
        <Button style={style} href="https://discord.gg/PwDmsnu" target="_blank">
            <img
                alt="discord icon"
                src={discordSVG}
                style={{ display: "inline-block", marginRight: 20, maxWidth: 40 }}
            />
            Ask for help on our Discord
        </Button>
    );
}
