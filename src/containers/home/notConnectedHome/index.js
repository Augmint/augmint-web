import React from "react";
import { Header, Container, Grid, Segment } from "semantic-ui-react";

import { BalanceIcon } from '../../../components/Icons';

import {keyFeatures} from './helpers.js';

import './styles.css';
import * as styles from './styles.js';

export default class NotConnectedHome extends React.Component {
    render() {
        return (
            <Container as="article">
                <Container textAlign="center" as="div" className="key-features">
                    <header className="key-features__header">
                        <Header textAlign="center" as="h2" size="large">
                            Augmint offers digital tokens (A-Euro) pegged to a fiat currency. Stored securely in a decentralised way, stable crypto tokens are instantly transferable worldwide.
                        </Header>
                    </header>

                    <div className="balance-image">
                        <BalanceIcon />
                    </div>

                    <Grid columns="equal" className="key-features__grid">
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
                </Container>
                    
            </Container>
        );
    }
}
