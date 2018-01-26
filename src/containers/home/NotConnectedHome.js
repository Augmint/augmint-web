import React from "react";
import { Header, Container, Image, Grid } from "semantic-ui-react";

import { BalanceIcon, StableIcon, DecentralizedIcon, SecureIcon } from '../../components/Icons';

import './custom_styles.css';
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
                        <Image centered>
                            <BalanceIcon />
                        </Image>
                    </div>

                    <Grid columns="equal" className="key-features__grid">
                        <Grid.Column textAlign="center">
                            <Image>
                                <StableIcon/>
                            </Image>
                            <Header as="h5">
                                Stable
                            </Header>
                            <p className="opac">
                                With tokens pegged to their respective fiat, Augmint has low volatility and offers the stability typical crypotcurrencies lack.
                            </p>
                        </Grid.Column>
                        <Grid.Column textAlign="center">
                            <Image centered>
                                <DecentralizedIcon/>
                            </Image>
                            <Header as="h5">
                                Decentralised
                            </Header>
                            <p className="opac">
                            Augmint operates in an open and transparent way, free from government, institutions, or banks. 
                            </p>
                        </Grid.Column>
                        <Grid.Column textAlign="center">
                            <Image>
                                <SecureIcon/>
                            </Image>
                            <Header as="h5">
                                Secure
                            </Header>
                            <p className="opac">
                            Built on blockchain technology, Augmint uses Etherum smart contracts that offer sophisticated cryptographic security.
                            </p>
                        </Grid.Column>
                    </Grid>
                </Container>
                    
            </Container>
        );
    }
}
