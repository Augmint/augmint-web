import React from "react";
import { Segment, Container, Header } from "semantic-ui-react";

export function Hero(props) {
    return (
        <Segment inverted textAlign="center" style={{ minHeight: 300, padding: "1em 0em" }} vertical>
            <Container text>
                <Header
                    as="h1"
                    content="Augmint"
                    inverted
                    style={{
                        fontSize: "4em",
                        fontWeight: "normal",
                        marginBottom: 0,
                        marginTop: "1em"
                    }}
                />
                <Header as="h2" inverted style={{ fontSize: "1.7em", fontWeight: "normal" }}>
                    Stable cryptocurrencies
                </Header>
            </Container>
        </Segment>
    );
}
