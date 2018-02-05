import React from "react";
import { Segment, Container, List, Image } from "semantic-ui-react";
import Subscribe from "./Subscribe";

import backgroundImg from "assets/images/globe.png";
import discordLogo from "assets/images/Discord-Logo.svg";

import "./custom_footer_style.css";

const segmentStyle = {
    background: "url(" + backgroundImg + ")",
    backgroundPosition: "top",
    backgroundSize: "cover"
};

export function AppFooter(props) {
    let community = "WE'RE AN ACTIVE COMUNITY",
        description =
            "We're a group of developers, entrepeneurs, economists and technologists. We have an open governance stucture - anyone can join at any time.";

    return (
        <Segment basic textAlign="center" className="footer" style={segmentStyle}>
            <Container fluid>
                <Segment basic as="h5" className="title">
                    {community}
                </Segment>
                <Segment basic as="p" className="description">
                    {description}
                </Segment>
                <Segment
                    basic
                    className="join-discord"
                    size="tiny"
                    as="a"
                    href="https://discord.gg/PwDmsnu"
                    target="_blank"
                >
                    <Image src={discordLogo} />
                    Talk to us on Discord
                </Segment>

                <List horizontal inverted divided link className="contact-list" style={{ marginTop: 40 }}>
                    <List.Item as="a" href="https://github.com/Augmint/augmint-core" target="_blank" content="GITHUB" />
                    <List.Item
                        as="a"
                        href="https://gitter.im/digital-credit-money/Lobby?utm_source=ProjectStatus&utm_medium=web&utm_campaign=init"
                        target="_blank"
                        content="GITTER"
                    />
                    <List.Item
                        as="a"
                        href="https://decent-team.slack.com/messages/C7J38BUM6/"
                        target="_blank"
                        content="SLACK"
                    />
                    <List.Item
                        as="a"
                        href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit"
                        target="_blank"
                        content="WHITEPAPER"
                    />
                    <List.Item
                        as="a"
                        href="/contact"
                        content="CONTACT"
                    />
                </List>
                <Subscribe />
            </Container>
        </Segment>
    );
}
