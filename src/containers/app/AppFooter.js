import React from "react";
import { NavLink } from "react-router-dom";
import Container from "components/augmint-ui/container";
import Segment from "components/augmint-ui/segment";
import List from "components/augmint-ui/list";
import Icon from "components/augmint-ui/icon";
import Subscribe from "./Subscribe";

import backgroundImg from "assets/images/globe.png";
import discordLogo from "assets/images/Discord-Logo.svg";
import decentlabs from "assets/images/decentlabs.png";
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
                        className="join-discord join"
                        href="https://discord.gg/PwDmsnu"
                        rel="noopener noreferrer"
                        target="_blank"
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        <img src={discordLogo} alt="discord logo" />
                        Talk to us on Discord
                    </a>
                    <a
                        className="join-telegram join"
                        href="https://t.me/augmint"
                        rel="noopener noreferrer"
                        target="_blank"
                        style={{ display: "flex", alignItems: "center" }}
                    >
                        <img src={telegramLogo} alt="telegram logo" />
                        Talk to us on Telegram
                    </a>
                </Segment>

                <List className="contact-list">
                    <List.Item>
                        <Icon name="github" style={{ marginRight: 5 }} />
                        <a href="https://github.com/Augmint" target="_blank" rel="noopener noreferrer">
                            GITHUB
                        </a>
                    </List.Item>
                    <List.Item>
                        <a
                            href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            WHITEPAPER
                        </a>
                    </List.Item>
                    <List.Item>
                        <NavLink to="/manifesto">MANIFESTO</NavLink>
                    </List.Item>
                    <List.Item>
                        <NavLink to="/disclaimer">DISCLAIMER</NavLink>
                    </List.Item>
                    {isConnected ? (
                        <List.Item>
                            <NavLink to="/under-the-hood" data-testid="underTheHoodLink">
                                UNDER THE HOOD
                            </NavLink>
                        </List.Item>
                    ) : null}
                    <List.Item>
                        <a href="mailto:hello@augmint.org">CONTACT</a>
                    </List.Item>
                </List>
                <Subscribe />
                <div className="partner">
                    <img src={decentlabs} alt="Decent Labs logo" />
                    <h5>
                        Augmint was born at{" "}
                        <a href="http://www.decent.org/" target="_blank" rel="noopener noreferrer">
                            Decent Labs
                        </a>
                        .
                    </h5>
                </div>
            </Container>
        </Segment>
    );
}
