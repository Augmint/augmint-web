import React from "react";
import { Header, Container, Grid, Segment, Rail, Responsive, Image } from "semantic-ui-react";

import { BalanceIcon, InterchangeIcon } from 'components/Icons';

import { keyFeatures, keyBenefits, howItWorks, teamMembers } from './helpers.js';

import './styles.css';
import * as styles from './styles.js';

export default class NotConnectedHome extends React.Component {
    render() {
        return (
            <Segment basic as="article">
                <Container>
                    <Segment basic textAlign="center" as="section" className="key-features large-gap">
                        <header className="key-features__header">
                            <Header textAlign="center" as="h1" size="large">
                                Augmint offers digital tokens (A-Euro) pegged to a fiat currency. Stored securely in a decentralised way, stable crypto tokens are instantly transferable worldwide.
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
                                    <Header as="h5">
                                        {feature.title}
                                    </Header>
                                    <p className="opac">
                                        {feature.text}
                                    </p>
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Segment>
                    <Segment basic textAlign="center" as="section">
                        <Header textAlign="center" as="h2">
                            It’s great for business
                        </Header>

                        <Grid columns="equal">
                            {keyBenefits.filter(item => item.type === 'business').map(item => (
                            <Grid.Column  mobile="16" computer="5" textAlign="left" key={item.pk}>
                                <div className="list-item">
                                    <p className="opac">
                                        {item.text}
                                    </p>
                                </div>
                            </Grid.Column>
                            ))}
                        </Grid>

                        <Header textAlign="center" as="h2" style={{marginTop: '100px'}}>
                            And for individuals
                        </Header>

                        <Grid columns="equal">
                            {keyBenefits.filter(item => item.type === 'individual').map(item => (
                            <Grid.Column  mobile="16" computer="5" textAlign="left" key={item.pk}>
                                <div className="list-item">
                                    <p className="opac">
                                        {item.text}
                                    </p>
                                </div>
                            </Grid.Column>
                            ))}
                        </Grid>
                    </Segment>
                </Container>

                <Segment basic as="section" className="how-to-use">
                    <Container>
                        <Header as="h2">
                            Augmint loans
                        </Header>
                        <p className="opac">
                            Augmint offers the ability to use your cryptocurrencies without<br/>losing them. Get an ACD loan and spend easily.
                        </p>
                        <Grid columns="equal">
                            {howItWorks
                                .filter(feature => feature.type === 'loan')
                                .map(feature => (
                                    <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                        <Segment style={styles.keyFeaturesSegment} basic>
                                            {feature.image}
                                        </Segment>
                                        <Header as="h5">
                                            {feature.title}
                                        </Header>
                                        <p className="opac">
                                            {feature.text}
                                        </p>
                                    </Grid.Column>
                                ))}
                        </Grid>
                        <Header as="h2">
                            Buy and sell A-Euro
                        </Header>
                        <Grid columns="equal">
                            {howItWorks
                                .filter(feature => feature.type === 'exchange')
                                .map(feature => (
                                    <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                        <Segment style={styles.keyFeaturesSegment} basic>
                                            {feature.image}
                                        </Segment>
                                        <Header as="h5">
                                            {feature.title}
                                        </Header>
                                        <p className="opac">
                                            {feature.text}
                                        </p>
                                    </Grid.Column>
                            ))}
                        </Grid>
                        <Header as="h2">
                            How to use your ACE
                        </Header>
                        <Grid columns="equal">
                            {howItWorks
                                .filter(feature => feature.type === 'use')
                                .map(feature => (
                                    <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                        <Segment style={styles.keyFeaturesSegment} basic>
                                            {feature.image}
                                        </Segment>
                                        <Header as="h5">
                                            {feature.title}
                                        </Header>
                                        <p className="opac">
                                            {feature.text}
                                        </p>
                                    </Grid.Column>
                            ))}
                        </Grid>
                        <Header as="h2">
                            Earn more with A-Euro, get premium by locking
                        </Header>
                        <Grid columns="equal">
                            {howItWorks
                                .filter(feature => feature.type === 'lock')
                                .map(feature => (
                                    <Grid.Column mobile="16" computer="5" textAlign="left" key={feature.pk}>
                                        <Segment style={styles.keyFeaturesSegment} basic>
                                            {feature.image}
                                        </Segment>
                                        <Header as="h5">
                                            {feature.title}
                                        </Header>
                                        <p className="opac">
                                            {feature.text}
                                        </p>
                                    </Grid.Column>
                            ))}
                        </Grid>
                    </Container>
                    {<Responsive as={Rail} minWidth={768} attached internal position='left' style={{width: 'auto'}}>
                        <div style={styles.howItWorksRail}>
                            <div style={styles.howItWorksRailBox}>
                                <div>1</div>
                                <div style={styles.howItWorksRailBoxSpan}>Euro</div>
                            </div>
                            <InterchangeIcon />
                            <div style={styles.howItWorksRailBox}>
                                <div>1</div>
                                <div style={styles.howItWorksRailBoxSpan}>A-Euro</div>
                            </div>
                        </div>
                    </Responsive>}
                </Segment>
                <Container>
                    <Segment basic textAlign="left" as="section">
                        <Header as="h2">
                            Team
                        </Header>
                        <Grid columns="equal">
                            {teamMembers.map(member => (
                                <Grid.Column mobile="16" computer="8" textAlign="left" key={member.pk}>
                                    <Image style={{filter: 'grayscale(100%)', width: '120px', height: '120px', marginRight: '36px'}} src={member.imgSrc} avatar floated="left" />
                                    <Header as="h3" style={{margin: '30px 0 0'}}>
                                        {member.name}
                                    </Header>
                                    <Header as="h5" style={{marginTop: '10px'}}>
                                        {member.title}
                                    </Header>
                                </Grid.Column>
                            ))}
                        </Grid>
                    </Segment>
                </Container>
            </Segment>
        );
    }
}
