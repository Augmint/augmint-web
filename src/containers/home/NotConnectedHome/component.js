import React from "react";
import { Header, Container, Grid, Segment, Rail, Responsive } from "semantic-ui-react";

import { BalanceIcon, InterchangeIcon } from 'components/Icons';

import { keyFeatures, keyBenefits, howItWorks } from './helpers.js';

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
                                <Grid.Column mobile="16" textAlign="center" key={feature.title}>
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
                            <Grid.Column  mobile="16" textAlign="left" key={item.pk}>
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
                            <Grid.Column  mobile="16" textAlign="left" key={item.pk}>
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
                            {howItWorks.map(feature => (
                                <Grid.Column textAlign="left" key={feature.pk}>
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
            </Segment>
        );
    }
}
