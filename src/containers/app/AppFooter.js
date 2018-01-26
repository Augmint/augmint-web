import React from "react";
import { Segment, Container, List } from "semantic-ui-react";
import backgroundImg from "assets/images/globe.png";

const style = {
  background: 'url(' + backgroundImg + ') no-repeat center',
  height: '100%',
  paddingTop: '353px',
  position: 'absolute',
  width: '100%',
}

const descriptionStyle = {
  margin: 'auto',
  marginBottom: 30,
  padding: 0,
  maxWidth: 397,
}


export function AppFooter(props) {
    let community = "WE'RE AN ACTIVE COMUNITY",
        description = "We're a group of developers, entrepeneurs, economists and technologists. We have an open governance stucture - anyone ca join at any time.";

    return (
        <Segment basic textAlign="center" style={style}>
            <Container fluid>
                <Segment basic style={{margin: 0}}>
                  {community}
                </Segment>
                <Segment basic size="small" style={descriptionStyle}>
                  {description}
                </Segment>
                <List horizontal inverted divided link>
                    <List.Item as='a' href="https://github.com/DecentLabs/dcm-poc" content="GITHUB" />
                    <List.Item as='a' href="https://gitter.im/" content="GITTER" />
                    <List.Item as='a' href="https://decent-team.slack.com" content="SLACK" />
                    <List.Item as='a' href="https://docs.google.com/document/d/1IQwGEsImpAv2Nlz5IgU_iCJkEqlM2VUHf5SFkcvb80A/edit" content="WHITEPAPER" />
                    <List.Item as='a' href="http://www.decent.org/" content="BLOG" />
                </List>
            </Container>
        </Segment>
    );
}
