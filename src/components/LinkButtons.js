import React from "react";
import Button from "components/augmint-ui/button";

import theme from "styles/theme";
import { remCalc } from "styles/theme";

import discordSVG from "assets/images/Discord-Logo.svg";
import telegramSVG from "assets/images/telegram_logo.svg";

const style = {
    color: theme.colors.secondary,
    cursor: "pointer",
    fontFamily: theme.typography.fontFamilies.default,
    display: "inline-flex",
    fontSize: remCalc(14),
    justifyContent: "flex-start",
    alignItems: "center",
    margin: "0 auto 10px auto",
    padding: 0,
    alignSelf: "center",
    whiteSpace: "nowrap",
    backgroundColor: "transparent",
    width: "100%"
};

export function DiscordButton(props) {
    return (
        <div style={{ width: 220, margin: " 0 auto" }}>
            <Button style={style} href="https://discord.gg/PwDmsnu" target="_blank">
                <img
                    alt="discord icon"
                    src={discordSVG}
                    style={{ display: "inline-block", marginRight: 14, maxWidth: 26 }}
                />
                Ask for help on our Discord
            </Button>
        </div>
    );
}

export function TelegramButton(props) {
    return (
        <div style={{ width: 220, margin: " 0 auto" }}>
            <Button style={style} href="https://t.me/augmint" target="_blank">
                <img
                    alt="telegram icon"
                    src={telegramSVG}
                    style={{ display: "inline-block", marginRight: 10, maxWidth: 30 }}
                />
                Ask for help on our Telegram
            </Button>
        </div>
    );
}
