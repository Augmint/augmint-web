import React from "react";
import { NavLink } from "react-router-dom";
import { List } from "semantic-ui-react";
import Container from "components/augmint-ui/container";
import Segment from "components/augmint-ui/segment";
import Subscribe from "./Subscribe";

import backgroundImg from "assets/images/globe.png";
import discordLogo from "assets/images/Discord-Logo.svg";
import decent from "assets/images/decent.png";
import telegramLogo from "assets/images/telegram_logo.svg";

import "./custom_footer_style.css";

const segmentStyle = {
    background: "url(" + backgroundImg + ")",
    backgroundPosition: "top",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    minHeight: 500,
    textAlign: "center"
};

export function AppFooter(props) {
    const { isConnected } = props.web3Connect;
    let community = "WE'RE AN ACTIVE COMUNITY",
        description =
            "We're a group of developers, entrepeneurs, economists and technologists. We have an open governance structure - anyone can join at any time.";

    return (
        <Segment className="footer" style={segmentStyle}>
            <Container>
                <h5 className="title">{community}</h5>
                <p className="description">{description}</p>
                <Segment className="chat-container">
                    <a
                        className="join-discord"
                        href="https://discord.gg/PwDmsnu"
                        target="_blank"
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        <img src={discordLogo} alt="discord logo" />
                        Talk to us on Discord
                    </a>
                    <a
                        className="join-telegram"
                        href="https://t.me/augmint"
                        target="_blank"
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        <img src={telegramLogo} alt="telegram logo" />
                        Talk to us on Telegram
                    </a>
                </Segment>

                <List horizontal inverted divided link className="contact-list" style={{ marginTop: 40 }}>
                    <List.Item>
                        <List.Icon name="github" size="large" verticalAlign="middle" />
                        <List.Content as="a" href="https://github.com/Augmint" target="_blank">
                            GITHUB
                        </List.Content>
                    </List.Item>
                    <List.Item
                        as="a"
                        href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit"
                        target="_blank"
                        content="WHITEPAPER"
                    />
                    <List.Item as={NavLink} to="/manifesto" content="MANIFESTO" />
                    <List.Item as={NavLink} to="/disclaimer" content="DISCLAIMER" />
                    {isConnected ? (
                        <List.Item
                            as={NavLink}
                            to="/under-the-hood"
                            data-testid="underTheHoodLink"
                            content="UNDER THE HOOD"
                        />
                    ) : null};
                    <List.Item as="a" href="/contact" content="CONTACT" />
                </List>
                <Subscribe />
                <div className="partner">
                    <img src={decent} alt="Decent logo" />
                    <h5>
                        Augmint was born at{" "}
                        <a href="http://www.decent.org/" target="_blank" rel="noopener noreferrer">
                            Decent
                        </a>.
                    </h5>
                </div>
            </Container>
        </Segment>
    );
}
