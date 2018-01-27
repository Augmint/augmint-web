import React from "react";
import { Header, Container, Grid, Segment } from "semantic-ui-react";

import { BalanceIcon } from '../../../components/Icons';

import { keyFeatures, keyBenefits } from './helpers.js';

import './styles.css';
import * as styles from './styles.js';

export default class NotConnectedHome extends React.Component {
    render() {
        return (
            <Container as="article">
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
                            <Grid.Column textAlign="center" key={feature.title}>
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
                        <Grid.Column textAlign="left" key={item.title}>
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
                        <Grid.Column textAlign="left" key={item.title}>
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
        );
    }
}
