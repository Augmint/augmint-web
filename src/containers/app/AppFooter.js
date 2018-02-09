import React from "react";
import { Segment, Container, List, Image } from "semantic-ui-react";
import Subscribe from "./Subscribe";

import backgroundImg from "assets/images/globe.png";
import discordLogo from "assets/images/Discord-Logo.svg";
import decent from 'assets/images/decent.png';

import "./custom_footer_style.css";

const segmentStyle = {
    background: "url(" + backgroundImg + ")",
    backgroundPosition: "top",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    minHeight: 500,
};

export function AppFooter(props) {
    let community = "WE'RE AN ACTIVE COMUNITY",
        description =
            "We're a group of developers, entrepeneurs, economists and technologists. We have an open governance structure - anyone can join at any time.";

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
                    <List.Item>
                        <List.Icon name='github' size='large' verticalAlign='middle' />
                        <List.Content as="a" href="https://github.com/Augmint" target="_blank">GITHUB</List.Content>
                    </List.Item>
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
                <div class="partner">
                  <img src={decent} alt="Decent logo" />
                  <h5>Augmint was born at <a href='http://www.decent.org/' target='_blank'>Decent</a>.</h5>
                </div>
            </Container>
        </Segment>
    );
}
