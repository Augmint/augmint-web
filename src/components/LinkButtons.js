import React from "react";
import { Segment, Image } from "semantic-ui-react";

import discordSVG from "assets/images/Discord-Logo.svg";

export function DiscordButton(props) {
    return (
        <Segment
            basic
            className="discord"
            size="small"
            as="a"
            href="https://discord.gg/PwDmsnu"
            target="_blank"
            style={{ color: "#ffad00", display: "block", fontSize: 18, lineHeight: 1.29, margin: 0, padding: 0 }}
        >
            <Image src={discordSVG} style={{ display: "inline-block", marginRight: 20, maxWidth: 40 }}/>
            Ask for help on our Discord
        </Segment>
    );
}
