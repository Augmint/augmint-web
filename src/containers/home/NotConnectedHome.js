import React from "react";
import { Header, Container, Divider, Image, Grid } from "semantic-ui-react";

export default class NotConnectedHome extends React.Component {
    render() {
        return (
            <Container as="article">
                <Container as="heading">
                    <Header textAlign="center" as="h2">
                        Augmint offers digital tokens (A-Euro) pegged to a fiat currency. Stored securely in a decentralised way, stable crypto tokens are instantly transferable worldwide.
                    </Header>
                </Container>
                <Divider hidden />
                <Container textAlign="center" as="section">
                    <Image centered>
                        <img src="http://placehold.it/400x200" />
                    </Image>
                </Container>
                <Divider hidden />
            </Container>
        );
    }
}
