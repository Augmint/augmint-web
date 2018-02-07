import React from "react";

import { throttle } from 'lodash';
import { Header, Container, Grid, Segment, Rail, Responsive, Image } from "semantic-ui-react";

import { BalanceIcon, InterchangeIcon } from "components/Icons";

import { keyFeatures, keyBenefits, howItWorks, teamMembers, partners } from "./helpers.js";

import "./styles.css";
import * as styles from "./styles.js";
import linkedinLogo from "assets/images/linkedin.png";
import githubLogo from "assets/images/GitHub.png";
import slackIcon from 'assets/images/slack-icon.svg';


export default class NotConnectedHome extends React.Component {
    constructor() {
        super();
        
        this.scrollHandler = throttle(this.handleScroll.bind(this), 300);
        this.state = {
            transform: 0
        };
      }
    
    handleScroll(e) {
        const howItWorksSectionRect = document.querySelector('.how-to-use').getBoundingClientRect();
        const minPos = 200;
        const maxPos = howItWorksSectionRect.height - 200;

        const itemTranslate = 
        Math.min(
            maxPos,
            Math.max(
                minPos,
                Math.ceil(-howItWorksSectionRect.y) + 200
            )
        );
    
        this.setState({
            transform: itemTranslate
        });
        
    }
    componentDidMount() {
        window.addEventListener('scroll', this.scrollHandler);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.scrollHandler);
    }

    render() {
        return (
            <Segment basic as="article">
                <Container>
                    <Segment basic textAlign="center" as="section" className="key-features large-gap">
                        <header className="key-features__header">
                            <Header textAlign="center" as="h1" size="large">
                                Augmint offers digital tokens pegged to a fiat currency.
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

                        <Grid columns="equal">
                            {keyFeatures.map(feature => (
                                <Grid.Column mobile="16" computer="5" textAlign="center" key={feature.title}>
                                    <Segment style={styles.keyFeaturesSegment} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h3" style={styles.keyFeaturesHeader}>{feature.title}</Header>
                                    <p className="opac">{feature.text}</p>
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Segment>
                    <Segment basic textAlign="center" as="section"  className="advantages">
                        <Header textAlign="center" as="h2">
                            Great for business
                        </Header>

                        <Grid columns="equal">
                            {keyBenefits.filter(item => item.type === "business").map(item => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={item.pk}>
                                    <div className="list-item">
                                        <p className="opac">{item.text}</p>
                                    </div>
                                </Grid.Column>
                            ))}
                        </Grid>

                        <Header textAlign="center" as="h2" style={{ marginTop: "100px" }}>
                            And for individuals
                        </Header>

                        <Grid columns="equal">
                            {keyBenefits.filter(item => item.type === "individual").map(item => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={item.pk}>
                                    <div className="list-item">
                                        <p className="opac">{item.text}</p>
                                    </div>
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Segment>
                </Container>

                <Segment basic as="section" className="how-to-use">
                    <Container>
                        <Header as="h2">Augmint loans</Header>
                        <p className="opac">
                            Use your cryptocurrencies without<br />losing them. Get a
                            loan and spend easily.
                        </p>
                        <Grid columns="equal">
                            {howItWorks.filter(feature => feature.type === "loan").map(feature => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                    <Segment style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h3" style={styles.howToUseHeader}>{feature.title}</Header>
                                    <p className="opac">{feature.text}</p>
                                </Grid.Column>
                            ))}
                        </Grid>
                        <Header as="h2">Buy and sell A-Euro</Header>
                        <Grid columns="equal">
                            {howItWorks.filter(feature => feature.type === "exchange").map(feature => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                    <Segment style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h4" style={styles.howToUseHeader}>{feature.title}</Header>
                                    <p className="opac">{feature.text}</p>
                                </Grid.Column>
                            ))}
                        </Grid>
                        <Header as="h2">How to use your A-Euro</Header>
                        <Grid columns="equal">
                            {howItWorks.filter(feature => feature.type === "use").map(feature => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                    <Segment style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h4" style={styles.howToUseHeader}>{feature.title}</Header>
                                    <p className="opac">{feature.text}</p>
                                </Grid.Column>
                            ))}
                        </Grid>
                        <Header as="h2">Earn more with A-Euro, get premium by locking</Header>
                        <Grid columns="equal">
                            {howItWorks.filter(feature => feature.type === "lock").map(feature => (
                                <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                    <Segment style={styles.howItWorksImage} basic>
                                        {feature.image}
                                    </Segment>
                                    <Header as="h4" style={styles.howToUseHeader}>{feature.title}</Header>
                                    <p className="opac">{feature.text}</p>
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Container>
                    {
                        <Responsive
                            as={Rail}
                            minWidth={768}
                            attached
                            internal
                            position="left"
                            style={{ width: "auto", position: "absolute", transform: `translateY(${this.state.transform}px)`, zIndex: "2", transition: 'transform 0.3s linear', }}
                        >
                            <a href="/tryit" id="useAEurButton" style={styles.useAEurButton}>
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
                    }
                </Segment>
                <Segment basic textAlign="left" as="section" className="team">
                  <Container>
                    <Header as="h2">Team</Header>
                    <Grid columns="equal">
                        {teamMembers.map(member => (
                            <Grid.Column mobile="16" computer="8" textAlign="left" key={member.pk}>
                                <Image
                                    src={member.imgSrc}
                                    avatar
                                    floated="left"
                                />
                                <Header as="h3">
                                    {member.name}
                                </Header>
                                <Header as="h5" style={{ margin: "10px 0 0" }}>
                                    {member.title}{member.portfolio && <Header as="a" href={member.portfolio} target="_blank" content=', PORTFOLIO' style={{ fontSize: 12 }} />}
                                    {member.linedinUrl && <Header as="a" href={member.linedinUrl} target="_blank" className="social" >
                                      <Image basic src={linkedinLogo} style={{ margin: 0, width: 14 }}/>
                                    </Header>}
                                    {member.githubUrl && <Header as="a" href={member.githubUrl} target="_blank" className="social" >
                                      <Image basic src={githubLogo} style={{ margin: 0, width: 14 }}/>
                                    </Header>}
                                </Header>
                                {member.description && <p className="description"> {member.description} </p>}
                            </Grid.Column>
                        ))}
                    </Grid>
                  </Container>
                </Segment>
                <Segment basic textAlign="left" as="section" className="partner" style={{ marginTop: 50 }}>
                  <Container>
                    <Grid columns="equal">
                        {partners.map(partner => (
                            <Grid.Column mobile="16" computer="8" textAlign="left" key={partner.pk}>
                                <Image
                                    src={partner.imgSrc}
                                    avatar
                                    floated="left"
                                />
                                <Header as="h3">
                                    {partner.name}
                                </Header>
                                {partner.description && <p className="description" dangerouslySetInnerHTML={{__html: partner.description}} style={{ marginBottom: 3 }} />}
                                {partner.slackUrl && <a href={partner.slackUrl} target="_blank"><img alt="slack icon" src={slackIcon} style={{ height: 14, marginRight: 10, width: 14 }}/>{partner.slackText || "Join our slack."}</a>}
                            </Grid.Column>
                        ))}
                    </Grid>
                  </Container>
                </Segment>
            </Segment>
        );
    }
}
