import React from "react";

import { Header, Container, Grid, Segment, Rail, Responsive, Image } from "semantic-ui-react";

import Button from "components/augmint-ui/button";

import { BalanceIcon, InterchangeIcon } from "components/Icons";

import { keyFeatures, keyBenefits, howItWorks, founders, teamMembers, partners } from "./helpers.js";
import { Member } from "./member.js";

import "./styles.css";
import * as styles from "./styles.js";
import slackIcon from "assets/images/slack-icon.svg";

export default class NotConnectedHome extends React.Component {
    constructor() {
        super();

        teamMembers.sort(function(a, b) {
            var nameA = a.lastName.toUpperCase();
            var nameB = b.lastName.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            // names must be equal
            return 0;
        });
    }

    render() {
        return (
            <Segment basic as="article">
                <Container>
                    <Segment basic textAlign="center" as="section" className="key-features large-gap">
                        <header className="key-features__header">
                            <Header textAlign="center" as="h1" size="large">
                                Augmint offers digital tokens targeted to a fiat currency.
                                <br />
                                The first Augmint token is <nobr>A-Euro</nobr>, pegged to Euro.
                                <br />
                                Stored securely and decentralised stable crypto tokens are instantly transferable
                                worldwide.
                            </Header>
                        </header>

                        <div className="balance-image">
                            <BalanceIcon />
                        </div>

                        <Grid columns="equal" style={{ justifyContent: "space-evenly" }}>
                            {keyFeatures.map(feature => (
                                <Grid.Column mobile="16" computer="5" textAlign="center" key={feature.title}>
                                    <Segment style={styles.keyFeaturesSegment} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h3" style={styles.keyFeaturesHeader}>
                                        {feature.title}
                                    </Header>
                                    <p className="opac" style={styles.howToUseText}>
                                        {feature.text}
                                    </p>
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Segment>
                    <Segment basic textAlign="center" as="section" className="advantages">
                        <Header textAlign="left" as="h2">
                            Great for business
                        </Header>

                        <Grid columns="equal" style={{ justifyContent: "space-evenly" }}>
                            {keyBenefits.filter(item => item.type === "business").map(item => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={item.pk}>
                                    <div className="list-item">
                                        <p className="opac" style={styles.howToUseText}>
                                            {item.text}
                                        </p>
                                    </div>
                                </Grid.Column>
                            ))}
                        </Grid>

                        <Header textAlign="left" as="h2" style={{ marginTop: "100px" }}>
                            And for individuals
                        </Header>

                        <Grid columns="equal" style={{ justifyContent: "space-evenly" }}>
                            {keyBenefits.filter(item => item.type === "individual").map(item => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={item.pk}>
                                    <div className="list-item">
                                        <p className="opac" style={styles.howToUseText}>
                                            {item.text}
                                        </p>
                                    </div>
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Segment>
                </Container>
                <Segment basic as="section" className="how-to-use">
                    <Responsive
                        as={Rail}
                        minWidth={768}
                        attached
                        internal
                        position="left"
                        style={{ width: "160px", position: "sticky", zIndex: "2", top: "200px", marginLeft: "-300px" }}
                    >
                        <a href="/tryit" tid="useAEurLinkSticky" style={styles.useAEurButton}>
                            <div style={styles.howItWorksRail}>
                                <div style={styles.howItWorksRailBox}>
                                    <div>1</div>
                                    <div style={styles.howItWorksRailBoxSpan}>Euro</div>
                                </div>
                                <InterchangeIcon />
                                <div style={styles.howItWorksRailBox}>
                                    <div>1</div>
                                    <div style={styles.howItWorksRailBoxSpan}>A-EUR</div>
                                </div>
                            </div>
                        </a>
                    </Responsive>
                    <Container>
                        <Header as="h2">Augmint loans</Header>
                        <p className="opac loans" style={styles.howToUseText}>
                            Use your cryptocurrencies without<br />losing them. Get a loan and spend easily.
                        </p>
                        <Grid columns="equal" style={{ justifyContent: "space-around" }}>
                            {howItWorks.filter(feature => feature.type === "loan").map(feature => (
                                <Grid.Column
                                    mobile="16"
                                    computer="5"
                                    textAlign="left"
                                    key={feature.pk}
                                    style={{ padding: 50, paddingBottom: 0 }}
                                >
                                    <Segment className="home-image" style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h4" style={styles.howToUseHeader}>
                                        {feature.title}
                                    </Header>
                                    <p className="opac" style={styles.howToUseText}>
                                        {feature.text}
                                    </p>
                                </Grid.Column>
                            ))}
                        </Grid>
                        <Segment basic style={{ margin: "15px 0 70px 0", textAlign: "center" }}>
                            <Button type="a" to="/tryit" color="primary" className="try-now">
                                Try now
                            </Button>
                        </Segment>
                        <Header as="h2">Buy and sell A-Euro</Header>
                        <Grid columns="equal" style={{ justifyContent: "space-around" }}>
                            {howItWorks.filter(feature => feature.type === "exchange").map(feature => (
                                <Grid.Column
                                    mobile="16"
                                    computer="5"
                                    textAlign="left"
                                    key={feature.pk}
                                    style={{ padding: 50, paddingBottom: 0 }}
                                >
                                    <Segment className="home-image" style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h4" style={styles.howToUseHeader}>
                                        {feature.title}
                                    </Header>
                                    <p className="opac" style={styles.howToUseText}>
                                        {feature.text}
                                    </p>
                                </Grid.Column>
                            ))}
                        </Grid>
                        <Segment basic style={{ margin: "15px 0 70px 0", textAlign: "center" }}>
                            <Button type="a" to="/tryit" color="primary" className="try-now">
                                Try now
                            </Button>
                        </Segment>
                        <Header as="h2">How to use your A-Euro</Header>
                        <Grid columns="equal" className="margin">
                            {howItWorks.filter(feature => feature.type === "use").map(feature => (
                                <Grid.Column
                                    mobile="16"
                                    computer="5"
                                    textAlign="left"
                                    key={feature.pk}
                                    style={{ padding: 50, paddingBottom: 0 }}
                                >
                                    <Segment className="home-image" style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h4" style={styles.howToUseHeader}>
                                        {feature.title}
                                    </Header>
                                    <p className="opac" style={styles.howToUseText}>
                                        {feature.text}
                                    </p>
                                </Grid.Column>
                            ))}
                        </Grid>
                        <Header as="h2">Earn more with A-Euro, get premium by locking</Header>
                        <Grid columns="equal" style={{ justifyContent: "space-around" }}>
                            {howItWorks.filter(feature => feature.type === "lock").map(feature => (
                                <Grid.Column
                                    mobile="16"
                                    computer="5"
                                    textAlign="left"
                                    key={feature.pk}
                                    style={{ padding: 50, paddingBottom: 0 }}
                                >
                                    <Segment className="home-image" style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h4" style={styles.howToUseHeader}>
                                        {feature.title}
                                    </Header>
                                    <p className="opac" style={styles.howToUseText}>
                                        {feature.text}
                                    </p>
                                </Grid.Column>
                            ))}
                        </Grid>
                        <Segment basic style={{ margin: "15px 0 70px 0", textAlign: "center" }}>
                            <Button type="a" to="/tryit" color="primary" className="try-now">
                                Try now
                            </Button>
                        </Segment>
                    </Container>
                </Segment>
                <Segment basic textAlign="left" as="section" className="team">
                    <Container>
                        <Header as="h2">Team</Header>
                        <Grid columns="equal" style={{ marginBottom: 75 }}>
                            {founders.map(member => <Member member={member} key={member.pk} />)}
                        </Grid>
                        <Grid columns="equal">
                            {teamMembers.map(member => <Member member={member} key={member.pk} />)}
                        </Grid>
                    </Container>
                </Segment>
                <Segment basic textAlign="left" as="section" className="partner" style={{ marginTop: 50 }}>
                    <Container>
                        <Grid columns="equal">
                            {partners.map(partner => (
                                <Grid.Column mobile="16" computer="8" textAlign="left" key={partner.pk}>
                                    <Image src={partner.imgSrc} avatar floated="left" />
                                    <Header as="h3">{partner.name}</Header>
                                    {partner.description && (
                                        <p
                                            className="description"
                                            dangerouslySetInnerHTML={{ __html: partner.description }}
                                            style={{ marginBottom: 3 }}
                                        />
                                    )}
                                    {partner.slackUrl && (
                                        <a href={partner.slackUrl} target="_blank">
                                            <img
                                                alt="slack icon"
                                                src={slackIcon}
                                                style={{ height: 14, marginRight: 10, width: 14 }}
                                            />
                                            {partner.slackText || "Join our slack."}
                                        </a>
                                    )}
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Container>
                </Segment>
            </Segment>
        );
    }
}
