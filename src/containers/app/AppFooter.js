import React from "react";
import { Link } from "react-router-dom";
import { Segment, Container, List, Image } from "semantic-ui-react";
import Subscribe from "./Subscribe";

import backgroundImg from "assets/images/globe.png";
import slackLogo from "assets/images/slack-icon.svg";

import './custom_footer_style.css';

const segmentStyle = {
  background: 'url(' + backgroundImg + ') no-repeat center',
}

export function AppFooter(props) {
    let community = "WE'RE AN ACTIVE COMUNITY",
        description = "We're a group of developers, entrepeneurs, economists and technologists. We have an open governance stucture - anyone ca join at any time.";

    return (
        <Segment basic textAlign="center" className='footer' style={segmentStyle}>
            <Container fluid>
                <Segment basic className='title'>
                  {community}
                </Segment>
                <Segment basic className='description'>
                  {description}
                </Segment>
                <Segment basic className='join-slack' size="tiny" as="a" href="https://decent-team.slack.com/messages/C7J38BUM6/" target="_blank">
                  <Image src={slackLogo} />
                  Join our Slack chanel
                </Segment>

                <List horizontal inverted divided link className='contact-list' style={{  marginTop: 40}}>
                    <List.Item as='a' href="https://github.com/DecentLabs/dcm-poc" target="_blank" content="GITHUB" />
                    <List.Item as='a' href="https://gitter.im/digital-credit-money/Lobby?utm_source=ProjectStatus&utm_medium=web&utm_campaign=init" target="_blank" content="GITTER" />
                    <List.Item as='a' href="https://decent-team.slack.com/messages/C7J38BUM6/" target="_blank" content="SLACK" />
                    <List.Item as='a' href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit" target="_blank" content="WHITEPAPER" />
                    <List.Item as='a' href="http://www.decent.org/" target="_blank" content="BLOG" />
                </List>
                <Subscribe />
            </Container>
        </Segment>
    );
}
