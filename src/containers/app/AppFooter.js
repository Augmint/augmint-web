import React from "react";
import { Link } from "react-router-dom";
import { Segment, Container, List, Image } from "semantic-ui-react";
import backgroundImg from "assets/images/globe.png";
import slackLogo from "assets/images/slack-icon.svg";

const segmentStyle = {
  background: 'url(' + backgroundImg + ') no-repeat center',
  height: '100%',
  paddingTop: '333px',
  position: 'absolute',
  width: '100%',
}

const footerTitleStyle = {
  color: '#fff',
  fontSize: 13,
  letterSpacing: 2.6,
  margin: 0,
}

const descriptionStyle = {
  color: '#fff',
  fontSize: 15,
  lineHeight: 1.47,
  margin: 'auto',
  marginBottom: 30,
  opacity: '0.7',
  padding: 0,
  maxWidth: 397,
}

const slackStyle = {
  color: '#ffad00',
  fontSize: 17,
  lineHeight: 1.29,
}

const slackImg = <Image src={slackLogo} as="a" size="tiny" href="http://decent-slack-autoinvite.herokuapp.com/" target="_blank" />;

export function AppFooter(props) {
    let community = "WE'RE AN ACTIVE COMUNITY",
        description = "We're a group of developers, entrepeneurs, economists and technologists. We have an open governance stucture - anyone ca join at any time.";

    return (
        <Segment basic textAlign="center" style={segmentStyle}>
            <Container fluid>
                <Segment basic style={footerTitleStyle}>
                  {community}
                </Segment>
                <Segment basic style={descriptionStyle}>
                  {description}
                </Segment>
                <Segment basic style={slackStyle}>
                  {slackImg}
                  Join our Slack chanel
                </Segment>

                <List horizontal inverted divided link>
                    <List.Item as='a' href="https://github.com/DecentLabs/dcm-poc" target="_blank" content="GITHUB" />
                    <List.Item as='a' href="https://gitter.im/" target="_blank" content="GITTER" />
                    <List.Item as='a' href="https://decent-team.slack.com" target="_blank" content="SLACK" />
                    <List.Item as='a' href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit" target="_blank" content="WHITEPAPER" />
                    <List.Item as='a' href="http://www.decent.org/" target="_blank" content="BLOG" />
                </List>
            </Container>
        </Segment>
    );
}
