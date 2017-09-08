import React from "react";
import { Segment, Container, Header } from "semantic-ui-react";
import { Link } from "react-router-dom";

export function Hero(props) {
    return (
        <Segment
            inverted
            textAlign="center"
            style={{ minHeight: 400, padding: "1em 0em" }}
            vertical
        >
            <Container text>
                <Header
                    as="h1"
                    content="Digital Credit Money"
                    inverted
                    style={{
                        fontSize: "4em",
                        fontWeight: "normal",
                        marginBottom: 0,
                        marginTop: "1em"
                    }}
                />
                <Header
                    as="h2"
                    inverted
                    style={{ fontSize: "1.7em", fontWeight: "normal" }}
                >
                    Stable cryptocurrencies
                </Header>

                <Segment inverted>
                    <p>
                        Digital cryptocurrencies which can function as medium of
                        exchange.
                    </p>
                    <p>
                        Read more about the the DCM concept on our{" "}
                        <Link
                            to="https://github.com/DecentLabs/ucd-poc"
                            target="_blank"
                        >
                            Github page
                        </Link>
                    </p>
                </Segment>
            </Container>
        </Segment>
    );
}
